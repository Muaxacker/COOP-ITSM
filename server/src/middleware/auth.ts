import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JwtPayload, Role } from '../types';
import { unauthorized, forbidden } from '../utils/response';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    return next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) {
      console.warn(`[AUTH FORBIDDEN] User '${req.user.email}' (role: ${req.user.role}) denied access to [${req.method} ${req.originalUrl}] - requires: [${roles.join(', ')}]`);
      return forbidden(res, 'You do not have permission to perform this action');
    }
    return next();
  };
}
