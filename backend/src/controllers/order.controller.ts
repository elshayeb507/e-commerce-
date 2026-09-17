import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';

// Generate unique order number like ORD-849201
const generateOrderNumber = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNum}`;
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, phone, secondaryPhone, governorate, city, address, notes, items } = req.body;

    // Validation
    if (!customerName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال جميع البيانات المطلوبة: الاسم، رقم الهاتف، والعنوان التفصيلي'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'السلة فارغة. يرجى إضافة منتجات قبل إتمام الطلب'
      });
    }

    // Recalculate prices from Database to prevent frontend price tampering
    let subtotal = 0;
    const validatedItems: IOrderItem[] = [];

    for (const item of items) {
      const productId = item.productId || item.product;
      const quantityKg = Number(item.quantityKg);

      if (!productId || isNaN(quantityKg) || quantityKg <= 0) {
        return res.status(400).json({
          success: false,
          message: 'بيانات بعض المنتجات في السلة غير صالحة'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `عذراً، المنتج المعرف بـ ${productId} غير متوفر في النظام`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `عذراً، المنتج "${product.name}" غير متاح حالياً`
        });
      }

      const pricePerKg = product.pricePerKg;
      const totalPrice = Number((pricePerKg * quantityKg).toFixed(2));
      subtotal += totalPrice;

      validatedItems.push({
        product: product._id,
        productName: product.name,
        pricePerKg,
        quantityKg,
        totalPrice
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const deliveryFee = 15; // Standard 15 EGP local delivery fee
    const total = Number((subtotal + deliveryFee).toFixed(2));

    let orderNumber = generateOrderNumber();
    let existingOrder = await Order.findOne({ orderNumber });
    while (existingOrder) {
      orderNumber = generateOrderNumber();
      existingOrder = await Order.findOne({ orderNumber });
    }

    const order = new Order({
      orderNumber,
      customerName,
      phone,
      secondaryPhone: secondaryPhone || '',
      governorate: governorate || 'أسيوط',
      city: city || '',
      address,
      notes: notes || '',
      items: validatedItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'تم استلام طلبك بنجاح',
      orderNumber: order.orderNumber,
      order
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند إنشاء الطلب', error: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.toString(), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { phone: searchRegex },
        { address: searchRegex }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب الطلبات', error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب تفاصيل الطلب', error: error.message });
  }
};

export const getOrderByNumber = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب الطلب', error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    if (orderStatus) {
      const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ success: false, message: 'حالة الطلب غير صالحة' });
      }
      order.orderStatus = orderStatus;

      // Auto update payment status to paid if order status marked as delivered
      if (orderStatus === 'delivered' && !paymentStatus) {
        order.paymentStatus = 'paid';
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'حالة الدفع غير صالحة' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return res.status(200).json({ success: true, message: 'تم تحديث حالة الطلب بنجاح', order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند تحديث حالة الطلب', error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    return res.status(200).json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند حذف الطلب', error: error.message });
  }
};
