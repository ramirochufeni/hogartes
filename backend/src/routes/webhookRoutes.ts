import { Router } from 'express';
import { handleMercadoPagoWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/mercadopago', handleMercadoPagoWebhook);

export default router;
