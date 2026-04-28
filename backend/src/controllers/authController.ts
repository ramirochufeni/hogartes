import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-hogartes-2026-local';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está en uso' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        email,
        name,
        passwordHash,
        role: 'CLIENT',
        isEmailVerified: false,
        updatedAt: new Date()
      },
      include: {
        providerProfile: {
          include: { subscription: true }
        }
      }
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.authtoken.create({
      data: {
        id: generateId(),
        userId: user.id,
        token: verificationToken,
        type: 'VERIFY_EMAIL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Enviar correo de verificación (fire-and-forget; los errores se loguean internamente)
    sendVerificationEmail(user.email, user.name, verificationToken).catch(() => { });

    res.status(201).json({
      message: 'Usuario registrado con éxito. Revisá tu casilla de correo para verificar la cuenta.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: { include: { subscription: true } }
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (user.isDeleted) {
      res.status(403).json({ error: 'Cuenta suspendida o eliminada' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({ error: 'unverified_email' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        providerProfile: user.providerProfile
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ error: 'Falta validación de Google.' });
      return;
    }

    // Leemos el Client ID en runtime (dotenv ya fue cargado en index.ts)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      console.error('[googleLogin] GOOGLE_CLIENT_ID no configurado en .env del backend');
      res.status(500).json({ error: 'Autenticación con Google no configurada en el servidor.' });
      return;
    }

    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('[googleLogin] Error al verificar token de Google:', err);
      res.status(401).json({ error: 'Firma de Google inválida.' });
      return;
    }

    if (!payload || !payload.email) {
      res.status(400).json({ error: 'No se pudo obtener información de tu cuenta.' });
      return;
    }

    const { email, name, given_name } = payload;
    const finalName = name || given_name || 'Usuario Google';

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: { include: { subscription: true } }
      }
    });

    // Caso A: Ya existe
    if (user) {
      if (user.isDeleted) {
        res.status(403).json({ error: 'Cuenta suspendida o eliminada' });
        return;
      }

      // Si no estaba verificado, lo verificamos ahora
      if (!user.isEmailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
          include: {
            providerProfile: { include: { subscription: true } }
          }
        });
      }
    }
    // Caso B: No existe, creamos su usuario
    else {
      // Generamos un hash ultra seguro y random para cumplir req de base
      const dummyString = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(dummyString, 10);

      user = await prisma.user.create({
        data: {
          email,
          name: finalName,
          passwordHash,
          role: 'CLIENT',
          isEmailVerified: true // Marcamos verificado pq viene de google oauth
        },
        include: {
          providerProfile: { include: { subscription: true } }
        }
      });
    }

    // Iniciar Sesión emitir Token
    const appToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Ingreso por Google exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        providerProfile: user?.providerProfile
      },
      token: appToken
    });

  } catch (error: any) {
    console.error('Error in googleLogin:', error);
    res.status(500).json({ error: 'Error del servidor procesando OAuth.' });
  }
};

// ... existing endpoints
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: { include: { subscription: true } }
      }
    });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        providerProfile: user.providerProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const upgradeProvider = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'PROVIDER',
        providerProfile: {
          create: {
            verificationStatus: 'PENDING'
          }
        }
      },
      include: {
        providerProfile: { include: { subscription: true } }
      }
    });
    const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      message: 'Cuenta actualizada a Prestador',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        providerProfile: updatedUser.providerProfile
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso Denegado: Credenciales de administrador inválidas' });
      return;
    }
    if (user.isDeleted) {
      res.status(403).json({ error: 'Acceso Denegado: Cuenta suspendida o eliminada' });
      return;
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(403).json({ error: 'Acceso Denegado: Credenciales de administrador inválidas' });
      return;
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      message: 'Login Admin exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Vuelve a añadir los de verificación por si el rollback de disco los borró
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) { res.status(400).json({ error: 'Token es requerido' }); return; }
    const authToken = await prisma.authtoken.findUnique({ where: { token } });
    if (!authToken || authToken.type !== 'VERIFY_EMAIL') { res.status(400).json({ error: 'El enlace es inválido' }); return; }
    if (new Date() > authToken.expiresAt) { res.status(400).json({ error: 'El enlace ha expirado' }); return; }
    await prisma.user.update({ where: { id: authToken.userId }, data: { isEmailVerified: true } });
    await prisma.authtoken.delete({ where: { id: authToken.id } });
    res.status(200).json({ message: 'Cuenta verificada correctamente' });
  } catch (error) { res.status(500).json({ error: 'Error interno del servidor' }); }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'El correo es requerido' }); return; }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(200).json({ message: 'Si el correo existe y no está verificado, recibirá un enlace nuevo.' }); return; }
    if (user.isEmailVerified) { res.status(400).json({ error: 'La cuenta ya está verificada. Podés iniciar sesión.' }); return; }
    await prisma.authtoken.deleteMany({ where: { userId: user.id, type: 'VERIFY_EMAIL' } });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + 24);
    await prisma.authtoken.create({ data: { id: generateId(), userId: user.id, token: verificationToken, type: 'VERIFY_EMAIL', expiresAt } });
    // Enviar nuevo correo de verificación (fire-and-forget)
    sendVerificationEmail(user.email, user.name, verificationToken).catch(() => { });
    res.status(200).json({ message: 'Nuevo enlace de verificación enviado exitosamente.' });
  } catch (error) { res.status(500).json({ error: 'Error interno del servidor' }); }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'El correo es requerido' }); return; }
    // Respuesta neutra: no revela si el email existe en el sistema
    res.status(200).json({ message: 'Si el correo existe, te enviaremos instrucciones.' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    await prisma.authtoken.deleteMany({ where: { userId: user.id, type: 'RESET_PASSWORD' } });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + 1);
    await prisma.authtoken.create({ data: { id: generateId(), userId: user.id, token: resetToken, type: 'RESET_PASSWORD', expiresAt } });
    // Enviar correo de reset (fuera del ciclo de respuesta para mantener respuesta neutra)
    sendPasswordResetEmail(user.email, user.name, resetToken).catch(() => { });
  } catch (error) { }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) { res.status(400).json({ error: 'Datos incompletos' }); return; }
    const authToken = await prisma.authtoken.findUnique({ where: { token } });
    if (!authToken || authToken.type !== 'RESET_PASSWORD') { res.status(400).json({ error: 'El enlace de recuperación es inválido' }); return; }
    if (new Date() > authToken.expiresAt) { res.status(400).json({ error: 'El enlace ha expirado' }); return; }
    if (newPassword.length < 6) { res.status(400).json({ error: 'Contraseña muy corta' }); return; }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: authToken.userId }, data: { passwordHash } });
    await prisma.authtoken.delete({ where: { id: authToken.id } });
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) { res.status(500).json({ error: 'Error interno del servidor' }); }
};
