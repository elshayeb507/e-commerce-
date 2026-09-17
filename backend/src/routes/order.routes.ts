import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  deleteOrder
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes (Customers create orders and track order success)
router.post('/', createOrder);
router.get('/track/:orderNumber', getOrderByNumber);

// Admin protected routes
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
