import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'غير مصرح للوصول - يرجى تسجيل الدخول' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_egypt_fresh_jwt_key_2026';

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'الجلسة غير صالحة أو منتهية الصلاحية' });
  }
};
