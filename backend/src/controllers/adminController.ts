import { RequestHandler } from 'express';
import prisma from '../config/db';

export const getDashboardMetrics: RequestHandler = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeProviders = await prisma.providerProfile.count({ where: { verificationStatus: 'VERIFIED' } });
    const pendingProviders = await prisma.providerProfile.count({ where: { verificationStatus: 'PENDING' } });
    const totalServices = await prisma.service.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });

    res.status(200).json({
      totalUsers,
      activeProviders,
      pendingProviders,
      totalServices,
      activeSubscriptions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};

export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDeleted: true,
        createdAt: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const getPendingProviders: RequestHandler = async (req, res, next) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener prestadores' });
  }
};

export const getAllProviders: RequestHandler = async (req, res, next) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        subscription: { select: { planType: true, status: true, expiresAt: true } },
        _count: { select: { service: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener prestadores' });
  }
};

export const updateProviderStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body; // 'VERIFIED' o 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const updated = await prisma.providerProfile.update({
      where: { id: id as string },
      data: { verificationStatus }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar prestador' });
  }
};

export const getAllServices: RequestHandler = async (req, res, next) => {
  try {
    const service = await prisma.service.findMany({
      include: {
        provider: { include: { user: { select: { name: true } }, subscription: true } },
        subcategory: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

export const getAllSubscriptions: RequestHandler = async (req, res, next) => {
  try {
    const subs = await prisma.subscription.findMany({
      include: {
        provider: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(subs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener suscripciones' });
  }
};

export const getAllNews: RequestHandler = async (req, res, next) => {
  try {
    const newsList = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(newsList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
};

export const createNews: RequestHandler = async (req, res, next) => {
  try {
    const { title, content, status, isFeatured, imageUrl } = req.body;
    const isPublic = status === 'PUBLISHED';
    const post = await prisma.news.create({
      data: {
        title, content, status: status || 'DRAFT', isFeatured: isFeatured || false,
        // @ts-ignore
        imageUrl: imageUrl || null,
        publishedAt: isPublic ? new Date() : null
      }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear noticia' });
  }
};

export const editNews: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, status, isFeatured, imageUrl } = req.body;
    const isPublic = status === 'PUBLISHED';
    const post = await prisma.news.update({
      where: { id: id as string },
      data: {
        title, content, status, isFeatured,
        // @ts-ignore
        imageUrl: imageUrl || null,
        publishedAt: isPublic ? new Date() : null
      }
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar noticia' });
  }
};

export const deleteNews: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar noticia' });
  }
};

export const getAllCollaborators: RequestHandler = async (req, res, next) => {
  try {
    const collaborators = await prisma.collaborator.findMany({
      include: {
        _count: {
          select: { subscription: true }
        },
        subscription: {
          include: {
            provider: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(collaborators);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
};

export const createCollaborator: RequestHandler = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Nombre y código son obligatorios' });
      return;
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate uniqueness
    const existing = await prisma.collaborator.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      res.status(400).json({ error: 'El código ingresado ya existe' });
      return;
    }

    const c = await prisma.collaborator.create({
      data: { name, code: normalizedCode }
    });
    res.status(201).json(c);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear colaborador' });
  }
};

export const updateCollaboratorStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const c = await prisma.collaborator.update({
      where: { id: id as string },
      data: { isActive: Boolean(isActive) }
    });

    res.status(200).json(c);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar colaborador' });
  }
};

export const deleteUser: RequestHandler = async (req: any, res, next) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
      return;
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });
    res.status(200).json({ message: 'Usuario eliminado lógicamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-hogartes-2026-local';

export const impersonateUser: RequestHandler = async (req: any, res, next) => {
  try {
    const { id } = req.params; // ID del usuario a impersonar
    const adminId = req.user?.id;

    if (adminId === id) {
      res.status(400).json({ error: 'No puedes impersonarte a ti mismo' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { providerProfile: true }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    if (targetUser.isDeleted) {
      res.status(400).json({ error: 'El usuario está eliminado (soft delete)' });
      return;
    }

    // Auditoría
    await prisma.auditlog.create({
      data: {
        adminId,
        userId: targetUser.id,
        action: 'IMPERSONATE',
        details: `Admin ${adminId} entró a la cuenta del usuario ${targetUser.id}`
      }
    });

    // Crear token temporal
    const token = jwt.sign(
      { id: targetUser.id, role: targetUser.role, isImpersonated: true },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira más rápido
    );

    res.status(200).json({
      message: `Sesión iniciada como ${targetUser.name}`,
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        providerProfile: targetUser.providerProfile || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión como el usuario' });
  }
};

export const getMessageReports: RequestHandler = async (req, res, next) => {
  try {
    // Obtenemos todos los mensajes
    const messages = await prisma.message.findMany({
      select: { createdAt: true, isRead: true }
    });

    // Agrupamos por mes (formato YYYY-MM)
    const grouped = messages.reduce((acc: Record<string, { total: number, unread: number }>, msg) => {
      const month = msg.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, unread: 0 };
      }
      acc[month].total += 1;
      if (!msg.isRead) {
        acc[month].unread += 1;
      }
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([month, data]) => ({
      month,
      total: data.total,
      unread: data.unread
    })).sort((a, b) => b.month.localeCompare(a.month)); // Más reciente primero

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte de mensajes' });
  }
};
