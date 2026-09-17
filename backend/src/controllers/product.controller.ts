import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

const createSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '');
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, featured, includeUnavailable } = req.query;
    const filter: any = {};

    if (includeUnavailable !== 'true') {
      filter.isAvailable = true;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (category) {
      // Check if category is ObjectId or slug
      if (category.toString().match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          return res.status(200).json({ success: true, count: 0, products: [] });
        }
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.toString(), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب المنتجات', error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب تفاصيل المنتج', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, image, pricePerKg, unit, isAvailable, isFeatured } = req.body;

    if (!name || !category || pricePerKg === undefined || pricePerKg <= 0 || !image) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال جميع البيانات المطلوبة (الاسم، التصنيف، السعر، والصورة)'
      });
    }

    const catExists = await Category.findById(category);
    if (!catExists) {
      return res.status(404).json({ success: false, message: 'التصنيف المختار غير موجود' });
    }

    let slug = createSlug(name);
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = new Product({
      name,
      slug,
      description: description || '',
      category,
      image,
      pricePerKg: Number(pricePerKg),
      unit: unit || 'كجم',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false
    });

    await product.save();
    await product.populate('category', 'name slug');

    return res.status(201).json({ success: true, message: 'تم إضافة المنتج بنجاح', product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند إضافة المنتج', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, image, pricePerKg, unit, isAvailable, isFeatured } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    if (name) {
      product.name = name;
      product.slug = createSlug(name);
    }
    if (description !== undefined) product.description = description;
    if (category) {
      const catExists = await Category.findById(category);
      if (!catExists) {
        return res.status(404).json({ success: false, message: 'التصنيف المختار غير موجود' });
      }
      product.category = category;
    }
    if (image !== undefined) product.image = image;
    if (pricePerKg !== undefined && pricePerKg > 0) product.pricePerKg = Number(pricePerKg);
    if (unit !== undefined) product.unit = unit;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    await product.save();
    await product.populate('category', 'name slug');

    return res.status(200).json({ success: true, message: 'تم تحديث المنتج بنجاح', product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند تحديث المنتج', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    return res.status(200).json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند حذف المنتج', error: error.message });
  }
};
