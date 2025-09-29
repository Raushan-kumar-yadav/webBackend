//import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
    }
  }
}

/**
 * verifyToken - extracts JWT from Authorization header (supports "Bearer <token>")
 *               verifies it and attaches userId and role to req.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization') || req.header('authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied - no token provided' });
  }

  // Support "Bearer <token>" or just raw token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ error: 'Access denied - token empty' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    // jwt.verify can return string or object; cast to expected shape
    const decoded = jwt.verify(token, secret) as { userId?: string; role?: string } | string;

    if (typeof decoded === 'string' || !decoded || !('userId' in decoded) || !decoded.userId) {
      return res.status(401).json({ error: 'Access denied - invalid token' });
    }

    // Attach to request (types extended above)
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(401).json({ error: 'Access denied - token verification failed' });
  }
}

/**
 * verifySeller - call after verifyToken, ensures role === 'seller'
 */
export function verifySeller(req: Request, res: Response, next: NextFunction) {
  if (req.role !== 'seller') {
    return res.status(403).json({ error: 'Forbidden - sellers only' });
  }
  next();
}
