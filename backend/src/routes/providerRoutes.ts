import { Router, RequestHandler } from 'express';
import {
  getProviderMe,
  updateProviderMe,
  subscribeCheckout,
  createProviderProfile,
  getPublicProvider,
  getLastTransaction,
  setFiscalData
} from '../controllers/providerController';
import { authenticateJWT, requireProvider } from '../middlewares/auth';

const router = Router();

// GET /api/provider/public/:username — Datos públicos del prestador
router.get('/public/:username', getPublicProvider as RequestHandler);

// GET /api/provider/me — Datos del prestador logueado (perfil + suscripción + conteo)
router.get('/me', authenticateJWT as RequestHandler, getProviderMe as RequestHandler);

// POST /api/provider/profile — Alta inicial como prestador (cambia rol)
router.post('/profile', authenticateJWT as RequestHandler, createProviderProfile as RequestHandler);

// PATCH /api/provider/me — Actualizar datos del perfil del prestador
router.patch('/me', authenticateJWT as RequestHandler, requireProvider as RequestHandler, updateProviderMe as RequestHandler);

// POST /api/provider/fiscal-data — Establecer datos fiscales por única vez
router.post('/fiscal-data', authenticateJWT as RequestHandler, requireProvider as RequestHandler, setFiscalData as RequestHandler);

// GET /api/provider/last-transaction — Última transacción del prestador
router.get('/last-transaction', authenticateJWT as RequestHandler, requireProvider as RequestHandler, getLastTransaction as RequestHandler);

// POST /api/provider/subscribe/checkout — Checkout con Mercado Pago
router.post('/subscribe/checkout', authenticateJWT as RequestHandler, requireProvider as RequestHandler, subscribeCheckout as RequestHandler);

export default router;
