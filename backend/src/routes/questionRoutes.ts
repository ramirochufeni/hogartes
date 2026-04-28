import { Router, RequestHandler } from 'express';
import { getQuestions, createQuestion } from '../controllers/questionController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/', getQuestions as RequestHandler);
router.post('/', authenticateJWT, createQuestion as RequestHandler);

export default router;
