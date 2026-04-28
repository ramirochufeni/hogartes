import { Router, RequestHandler } from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} from '../controllers/conversationController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authenticateJWT as RequestHandler);

// POST /api/conversations/service/:serviceId - Inicia o recupera chat (solo CLIENT)
router.post('/service/:serviceId', getOrCreateConversation as RequestHandler);

// GET /api/conversations - Lista chats del usuario
router.get('/', getConversations as RequestHandler);

// GET /api/conversations/unread-count - Contador de mensajes no leídos (must be before /:id)
router.get('/unread-count', getUnreadCount as RequestHandler);

// GET /api/conversations/:id/messages - Obtiene mensajes
router.get('/:id/messages', getMessages as RequestHandler);

// POST /api/conversations/:id/messages - Envía mensaje
router.post('/:id/messages', sendMessage as RequestHandler);

// PATCH /api/conversations/:id/read - Marca como leído
router.patch('/:id/read', markAsRead as RequestHandler);

export default router;
