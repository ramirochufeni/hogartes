import { Router, RequestHandler } from 'express';
import { getServices, createService, getMyServices, getServiceById, updateService, deleteService } from '../controllers/serviceController';
import { authenticateJWT, requireProvider } from '../middlewares/auth';
import reviewRoutes from './reviewRoutes';
import questionRoutes from './questionRoutes';

const router = Router();

router.get('/', getServices);

router.get('/me/services', authenticateJWT as RequestHandler, requireProvider as RequestHandler, getMyServices);

router.post(
  '/create', 
  authenticateJWT as RequestHandler, 
  requireProvider as RequestHandler, 
  createService
);

router.patch(
  '/:id',
  authenticateJWT as RequestHandler,
  requireProvider as RequestHandler,
  updateService as RequestHandler
);

router.delete(
  '/:id',
  authenticateJWT as RequestHandler,
  requireProvider as RequestHandler,
  deleteService as RequestHandler
);

router.get('/:id', getServiceById);

router.use('/:serviceId/reviews', reviewRoutes);
router.use('/:serviceId/questions', questionRoutes);

export default router;
