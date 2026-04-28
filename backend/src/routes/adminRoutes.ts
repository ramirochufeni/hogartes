import { Router, RequestHandler } from 'express';
import { 
  getDashboardMetrics, 
  getAllUsers, 
  getPendingProviders,
  getAllProviders,
  updateProviderStatus, 
  getAllServices, 
  getAllSubscriptions,
  getAllNews,
  createNews,
  editNews,
  deleteNews,
  getAllCollaborators,
  createCollaborator,
  updateCollaboratorStatus,
  deleteUser,
  impersonateUser,
  getMessageReports
} from '../controllers/adminController';

const router = Router();

router.get('/metrics', getDashboardMetrics);
router.get('/users', getAllUsers);
router.get('/providers', getAllProviders as RequestHandler);
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:id/status', updateProviderStatus as RequestHandler);
router.get('/services', getAllServices);
router.get('/subscriptions', getAllSubscriptions);

router.delete('/users/:id', deleteUser as RequestHandler);
router.post('/users/:id/impersonate', impersonateUser as RequestHandler);
router.get('/reports/messages', getMessageReports as RequestHandler);

router.get('/news', getAllNews);
router.post('/news', createNews);
router.patch('/news/:id', editNews as RequestHandler);
router.delete('/news/:id', deleteNews as RequestHandler);

router.get('/collaborators', getAllCollaborators);
router.post('/collaborators', createCollaborator as RequestHandler);
router.patch('/collaborators/:id/status', updateCollaboratorStatus as RequestHandler);

export default router;
