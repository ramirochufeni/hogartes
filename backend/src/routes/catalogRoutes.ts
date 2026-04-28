import { Router } from 'express';
import { getCategories, createCategoryTest } from '../controllers/catalogController';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories-test', createCategoryTest); // Endopoint auxiliar de prueba

export default router;
