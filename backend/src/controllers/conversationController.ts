import { RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Polyfill for uuid since @types/uuid is not installed
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * POST /api/conversations/service/:serviceId
 * Get or create a conversation. Only CLIENT can initiate.
 *
 * IMPORTANT: In the DB, service.providerId = providerprofile.id (NOT user.id)
 * but conversation.providerId = user.id of the provider.
 * We resolve the user.id via service → provider (ProviderProfile) → userId.
 *
 * In ServiceInclude, the ProviderProfile relation is called "provider" (not "providerprofile").
 */
export const getOrCreateConversation: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const clientId = authReq.user?.id;
    const userRole = authReq.user?.role;
    const serviceId = String(req.params.serviceId);

    if (!clientId) { res.status(401).json({ error: 'No autorizado' }); return; }
    if (userRole !== 'CLIENT') { res.status(403).json({ error: 'Solo los clientes pueden iniciar conversaciones' }); return; }

    // ServiceInclude: "provider" → ProviderProfile (not "providerprofile")
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: { select: { userId: true } } }
    });

    if (!service) { res.status(404).json({ error: 'Servicio no encontrado' }); return; }

    const providerUserId = service.provider?.userId;
    if (!providerUserId) { res.status(404).json({ error: 'Prestador no encontrado' }); return; }
    if (providerUserId === clientId) { res.status(400).json({ error: 'No podés iniciar una conversación con vos mismo' }); return; }

    // conversation.clientId  = user.id of client
    // conversation.providerId = user.id of provider (NOT providerprofile.id)
    let conversation = await prisma.conversation.findUnique({
      where: {
        clientId_providerId_serviceId: {
          clientId,
          providerId: providerUserId,
          serviceId
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: generateId(),
          clientId,
          providerId: providerUserId,
          serviceId,
          updatedAt: new Date()
        }
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * GET /api/conversations
 * ConversationInclude uses: service, client, provider, messages
 */
export const getConversations: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ clientId: userId }, { providerId: userId }] },
      include: {
        service: { select: { id: true, title: true, coverImage: true } },
        client: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Enrich with providerPublicUsername via a separate lookup (avoids nested relation issues)
    const providerUserIds = [...new Set(conversations.map(c => c.providerId))];
    const providerProfiles = providerUserIds.length > 0
      ? await prisma.providerprofile.findMany({
          where: { userId: { in: providerUserIds } },
          select: { userId: true, publicUsername: true }
        })
      : [];
    const profileMap = new Map(providerProfiles.map(p => [p.userId, p.publicUsername]));

    const enriched = conversations.map(conv => ({
      id: conv.id,
      serviceId: conv.serviceId,
      clientId: conv.clientId,
      providerId: conv.providerId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      service: conv.service,
      client: conv.client,
      provider: conv.provider,
      lastMessage: conv.messages[0] ?? null,
      providerPublicUsername: profileMap.get(conv.providerId) ?? null
    }));

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * GET /api/conversations/:id/messages
 * MessageInclude uses: sender, conversation
 */
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const conversationId = String(req.params.id);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) { res.status(404).json({ error: 'Conversación no encontrada' }); return; }
    if (conversation.clientId !== userId && conversation.providerId !== userId) {
      res.status(403).json({ error: 'No tenés permiso para ver esta conversación' }); return;
    }

    // MessageInclude uses "sender" (not "user")
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } }
    });

    const normalized = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      senderName: (msg as any).sender?.name ?? null
    }));

    res.status(200).json(normalized);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /api/conversations/:id/messages
 */
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const conversationId = String(req.params.id);
    const { content } = req.body;
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }
    if (!content || content.trim().length === 0) { res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío' }); return; }

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) { res.status(404).json({ error: 'Conversación no encontrada' }); return; }
    if (conversation.clientId !== userId && conversation.providerId !== userId) {
      res.status(403).json({ error: 'No tenés permiso para responder en esta conversación' }); return;
    }

    const [msg] = await prisma.$transaction([
      prisma.message.create({
        data: { id: generateId(), conversationId, senderId: userId, content: content.trim() }
      }),
      prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })
    ]);

    res.status(201).json({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      senderName: null
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * PATCH /api/conversations/:id/read
 */
export const markAsRead: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const conversationId = String(req.params.id);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) { res.status(404).json({ error: 'Conversación no encontrada' }); return; }
    if (conversation.clientId !== userId && conversation.providerId !== userId) {
      res.status(403).json({ error: 'No tenés permiso para esta conversación' }); return;
    }

    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * GET /api/conversations/unread-count
 * Returns total count of unread messages received by the authenticated user.
 */
export const getUnreadCount: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        conversation: {
          OR: [{ clientId: userId }, { providerId: userId }]
        }
      }
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

