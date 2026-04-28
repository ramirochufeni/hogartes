import { RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/db';
import { containsProfanity } from '../helpers/profanityFilter';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const getReviews: RequestHandler = async (req, res) => {
  try {
    const serviceId = String(req.params.serviceId);

    const reviews = await prisma.review.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } }
    });

    const count = reviews.length;
    const average = count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : null;

    const normalized = reviews.map(r => ({
      id: r.id,
      serviceId: r.serviceId,
      userId: r.userId,
      userName: r.user?.name ?? 'Usuario',
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt
    }));

    res.status(200).json({ reviews: normalized, average, count });
  } catch (error) {
    console.error('Error in getReviews:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createReview: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;
    const serviceId = String(req.params.serviceId);
    const { rating, comment } = req.body;

    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    if (userRole !== 'CLIENT') {
      res.status(403).json({ error: 'Solo los clientes pueden dejar reseñas.' });
      return;
    }

    const ratingNum = Number(rating);
    if (!rating || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: 'El rating debe ser un número entero entre 1 y 5.' });
      return;
    }

    if (comment && containsProfanity(String(comment))) {
      res.status(400).json({ error: 'El contenido contiene términos no permitidos.' });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: { select: { userId: true } } }
    });

    if (!service) { res.status(404).json({ error: 'Servicio no encontrado' }); return; }

    if (service.provider?.userId === userId) {
      res.status(403).json({ error: 'No podés dejar una reseña en tu propio servicio.' });
      return;
    }

    const existing = await prisma.review.findUnique({
      where: { userId_serviceId: { userId, serviceId } }
    });
    if (existing) {
      res.status(400).json({ error: 'Ya dejaste una reseña para este servicio.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        id: generateId(),
        serviceId,
        userId,
        rating: ratingNum,
        comment: comment ? String(comment).trim() : null,
        updatedAt: new Date()
      },
      include: { user: { select: { id: true, name: true } } }
    });

    res.status(201).json({
      id: review.id,
      serviceId: review.serviceId,
      userId: review.userId,
      userName: review.user?.name ?? 'Usuario',
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(400).json({ error: 'Ya dejaste una reseña para este servicio.' });
      return;
    }
    console.error('Error in createReview:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
