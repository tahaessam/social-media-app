import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import cacheProvider from '../utils/redis.service.js';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Access denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Record<string, any>;
    const cachedToken = await cacheProvider.get(`session:${decoded.userId}`);
    if (!cachedToken || cachedToken !== token) {
      res.status(401).json({ message: 'Session expired or invalidated' });
      return;
    }

    req.user = { ...decoded, _id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
};
