import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_egypt_fresh_jwt_key_2026';
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const admin = await Admin.findById(req.admin.id).select('-passwordHash');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'الحساب غير موجود' });
    }

    return res.status(200).json({ success: true, admin });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر', error: error.message });
  }
};
