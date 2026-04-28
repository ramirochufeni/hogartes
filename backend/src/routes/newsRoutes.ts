import { Router } from 'express';
import { getPublicNews, getPublicNewsById } from '../controllers/newsController';

const router = Router();

router.get('/', getPublicNews);
router.get('/:id', getPublicNewsById);

export default router;
