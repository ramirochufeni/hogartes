import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-hogartes-2026-local';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user: any) => {
      if (err) {
        res.status(403).json({ error: 'Token inválido o expirado' });
        return;
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Se requiere token de autorización' });
  }
};

export const requireProvider = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'PROVIDER' && req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acceso denegado: Se requiere perfil de Prestador' });
    return;
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Administrador' });
    return;
  }
  next();
};
