import { RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/db';
import { containsProfanity } from '../helpers/profanityFilter';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const getQuestions: RequestHandler = async (req, res) => {
  try {
    const serviceId = String(req.params.serviceId);

    const questions = await prisma.question.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
      include: {
        user_question_userId: { select: { id: true, name: true } },
        user_question_answeredById: { select: { id: true, name: true } }
      }
    });

    const normalized = questions.map(q => ({
      id: q.id,
      serviceId: q.serviceId,
      userId: q.userId,
      userName: q.user_question_userId?.name ?? 'Usuario',
      content: q.content,
      answer: q.answer ?? null,
      answeredAt: q.answeredAt ?? null,
      answeredByName: q.user_question_answeredById?.name ?? null,
      createdAt: q.createdAt
    }));

    res.status(200).json(normalized);
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createQuestion: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;
    const serviceId = String(req.params.serviceId);
    const { content } = req.body;

    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    if (userRole !== 'CLIENT') {
      res.status(403).json({ error: 'Solo los clientes pueden hacer preguntas.' });
      return;
    }

    if (!content || String(content).trim().length === 0) {
      res.status(400).json({ error: 'La pregunta no puede estar vacía.' });
      return;
    }

    if (containsProfanity(String(content))) {
      res.status(400).json({ error: 'El contenido contiene términos no permitidos.' });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: { select: { userId: true } } }
    });

    if (!service) { res.status(404).json({ error: 'Servicio no encontrado' }); return; }

    if (service.provider?.userId === userId) {
      res.status(403).json({ error: 'No podés hacer preguntas en tu propio servicio.' });
      return;
    }

    const question = await prisma.question.create({
      data: {
        id: generateId(),
        serviceId,
        userId,
        content: String(content).trim(),
        updatedAt: new Date()
      },
      include: {
        user_question_userId: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({
      id: question.id,
      serviceId: question.serviceId,
      userId: question.userId,
      userName: question.user_question_userId?.name ?? 'Usuario',
      content: question.content,
      answer: null,
      answeredAt: null,
      answeredByName: null,
      createdAt: question.createdAt
    });
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const answerQuestion: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const questionId = String(req.params.questionId);
    const { answer } = req.body;

    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    if (!answer || String(answer).trim().length === 0) {
      res.status(400).json({ error: 'La respuesta no puede estar vacía.' });
      return;
    }

    if (containsProfanity(String(answer))) {
      res.status(400).json({ error: 'El contenido contiene términos no permitidos.' });
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        service: {
          include: { provider: { select: { userId: true } } }
        }
      }
    });

    if (!question) { res.status(404).json({ error: 'Pregunta no encontrada' }); return; }

    if (question.service.provider?.userId !== userId) {
      res.status(403).json({ error: 'Solo el dueño del servicio puede responder.' });
      return;
    }

    if (question.answer !== null) {
      res.status(400).json({ error: 'Esta pregunta ya tiene una respuesta.' });
      return;
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        answer: String(answer).trim(),
        answeredAt: new Date(),
        answeredById: userId,
        updatedAt: new Date()
      },
      include: {
        user_question_userId: { select: { id: true, name: true } },
        user_question_answeredById: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      id: updated.id,
      serviceId: updated.serviceId,
      userId: updated.userId,
      userName: updated.user_question_userId?.name ?? 'Usuario',
      content: updated.content,
      answer: updated.answer,
      answeredAt: updated.answeredAt,
      answeredByName: updated.user_question_answeredById?.name ?? null,
      createdAt: updated.createdAt
    });
  } catch (error) {
    console.error('Error in answerQuestion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
