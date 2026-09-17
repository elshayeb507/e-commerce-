import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const preparingOrders = await Order.countDocuments({ orderStatus: 'preparing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    // Calculate total revenue from delivered/confirmed orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $in: ['confirmed', 'preparing', 'out_for_delivery', 'delivered'] } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } }
    ]);

    const totalSales = revenueAgg.length > 0 ? revenueAgg[0].totalSales : 0;

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        availableProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        preparingOrders,
        deliveredOrders,
        totalSales
      },
      recentOrders
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب إحصائيات لوحة التحكم', error: error.message });
  }
};
