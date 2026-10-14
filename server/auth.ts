import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbService, UserDocument } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'technologic_super_secret_jwt_key_2026';

// Lightweight, secure HMAC token implementation for self-contained execution
export function createToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSignature) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (payload && payload.sub) {
    const user = await dbService.findUserById(payload.sub);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Faça login para continuar.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({
      error: 'Token inválido ou expirado.',
      code: 'INVALID_TOKEN'
    });
  }

  const user = await dbService.findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({
      error: 'Usuário não encontrado.',
      code: 'USER_NOT_FOUND'
    });
  }

  req.user = user;
  next();
}
