import { Router, RequestHandler } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/', getReviews as RequestHandler);
router.post('/', authenticateJWT, createReview as RequestHandler);

export default router;
