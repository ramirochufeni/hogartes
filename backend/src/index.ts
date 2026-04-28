import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import catalogRoutes from './routes/catalogRoutes';
import serviceRoutes from './routes/serviceRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import newsRoutes from './routes/newsRoutes';
import providerRoutes from './routes/providerRoutes';
import webhookRoutes from './routes/webhookRoutes';
import conversationRoutes from './routes/conversationRoutes';
import { authenticateJWT, requireAdmin } from './middlewares/auth';
import { answerQuestion } from './controllers/questionController';

// Inicializar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Endpoints / Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', authenticateJWT, requireAdmin, adminRoutes);

// Questions global routes (for answering)
app.patch('/api/questions/:questionId/answer', authenticateJWT, answerQuestion as any);

// Endpoint de prueba ("Hello World")
app.get('/', (_req, res) => {
  res.json({ message: 'Bienvenido al Backend de HogArtes API =)' });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`✓ Backend Express + TypeScript ejecutándose en: http://localhost:${PORT}`);
});
