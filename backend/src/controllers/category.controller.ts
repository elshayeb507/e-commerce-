import { Request, Response } from 'express';
import { Category } from '../models/Category';

// Helper to generate Arabic-friendly slugs
const createSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '');
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    return res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب التصنيفات', error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }
    return res.status(200).json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند جلب بيانات التصنيف', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'اسم التصنيف مطلوب' });
    }

    let slug = createSlug(name);
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = new Category({
      name,
      slug,
      description: description || '',
      image: image || '',
      isActive: isActive !== undefined ? isActive : true
    });

    await category.save();
    return res.status(201).json({ success: true, message: 'تم إضافة التصنيف بنجاح', category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند إضافة التصنيف', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }

    if (name) {
      category.name = name;
      category.slug = createSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return res.status(200).json({ success: true, message: 'تم تحديث التصنيف بنجاح', category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند تحديث التصنيف', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }
    return res.status(200).json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'حدث خطأ عند حذف التصنيف', error: error.message });
  }
};
