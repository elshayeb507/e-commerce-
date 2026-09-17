# 🛒 سوق آل حمام | Egypt Fresh Store (Vegetables & Fruits E-Commerce)

تطبيق متجر إلكتروني حديث ومتكامل لشراء وتوصيل الخضراوات والفواكه الطازجة في مصر. صُمم التطبيق بواجهة مستخدم جذابة وسريعة لدعم تجربة شراء سلسة بدون الحاجة لتسجيل حساب للزبون، مع نظام حساب تلقائي للأوزان بالجرام والكيلو، وربط الطلبات مباشرة بالواتساب (WhatsApp Integration)، ولوحة تحكم كاملة ومحمية لإدارة المتجر المبيعات.

---

## 🌟 مميزات النظام الرئيسية

- **🛒 شراء بدون حساب (Guest Checkout)**: تجربة طلب سريعة وسلسة دون الحاجة لإنشاء حساب أو كلمة مرور للزبون.
- **⚖️ نظام تحديد الأوزان المرن (Weight & Quantity System)**:
  - إمكانية اختيار أوزان مسبقة (¼ كجم، ½ كجم، 1 كجم، 2 كجم، 3 كجم، 5 كجم) أو تحديد الوزن بالجرام.
  - احتساب السعر حياً في الواجهة وبشكل آمن في الخلفية اعتماداً على سعر الكيلو `pricePerKg`.
- **📲 ربط الواتساب المباشر (WhatsApp Order Confirmation)**:
  - فور إتمام الطلب، يتم إنشاء زر يفتح تطبيق الواتساب مباشرة برقم المتجر مع نص رسالة منسقة تحتوي على تفاصيل الطلب رقم (#ORD-XXXXXX)، المنتجات والأوزان، العنوان، والإجمالي.
- **🛡️ لوحة تحكم كاملة للإدارة (Admin Dashboard & Control Panel)**:
  - محمية بنظام تشفير أمان وتوكين (JWT Auth & Bcrypt).
  - إحصائيات حية: إجمالي المبيعات، عدد الطلبات، الطلبات المعلقة، والمنتجات.
  - **إدارة المنتجات (CRUD)**: إضافة، تعديل، حذف، تغيير أسعار الكيلو، الصور، وحالة التوفر والتميز.
  - **إدارة التصنيفات (CRUD)**: إضافة وتعديل أقسام الخضار، الفاكهة، الورقيات، الموالح، والمنتجات العضوية.
  - **متابعة وحالات الطلبات**: تحديث حالة الطلب (`قيد الانتظار` ← `تم التأكيد` ← `جاري التجهيز` ← `خرج للتوصيل` ← `تم التسليم` / `ملغي`).

---

## 💻 التقنيات المستخدمة (Tech Stack)

### الواجهة الأمامية (Frontend):
- **الإطار**: Angular 22 (Standalone Components Architecture)
- **اللغة**: TypeScript
- **التصميم والواجهة**: Bootstrap 5 (RTL Support), Bootstrap Icons, Modern Sleek Dark Aesthetics, Custom CSS Variables & Animations.

### الخلفية (Backend):
- **البيئة**: Node.js & Express.js REST API
- **اللغة**: TypeScript
- **الحماية والأمان**: JWT Authentication, Bcryptjs Password Hashing, CORS Protection.

### قاعدة البيانات (Database):
- **قاعدة البيانات**: MongoDB Atlas (Cloud) / Local MongoDB
- **الربط (ODM)**: Mongoose

---

## 📁 هيكل المشروع (Project Structure)

```text
vegetables-fruits-store/
├── backend/
│   ├── src/
│   │   ├── controllers/      # المتحكمات لـ Auth, Products, Categories, Orders, Dashboard
│   │   ├── middleware/       # أمان التوكين JWT Auth Middleware
│   │   ├── models/           # نماذج البيانات (Admin, Product, Category, Order)
│   │   ├── routes/           # مسارات الـ REST API
│   │   ├── seed.ts           # سكربت تعبئة البيانات الأولية
│   │   └── index.ts          # نقطة دخول الخادم Express Server
│   ├── .env                  # متغيرات البيئة لخادم الخلفية
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/         # الخدمات (ApiService, AuthService, CartService) والأنواع
    │   │   ├── features/     # الصفحات (Home, Products, Cart, Checkout, Admin Panel)
    │   │   └── shared/       # المكونات المشتركة (ProductCard, Navbar, Footer)
    │   └── environments/     # إعدادات البيئة (environment.ts & environment.prod.ts)
    ├── angular.json
    └── package.json
```

---

## 🚀 كيفية تشغيل المشروع محلياً (Local Development Setup)

### 1️⃣ تشغيل الخلفية (Backend Setup)

```bash
cd backend

# 1. تثبيت الحزم والمكتبات
npm install

# 2. تعبئة قاعدة البيانات بالبيانات الأولية (18 منتج و 5 تصنيفات وحساب أدمن)
npm run seed

# 3. تشغيل الخادم في وضع التطوير
npm run dev
```

* الخادم يعمل على: `http://localhost:5000`

---

### 2️⃣ تشغيل الواجهة الأمامية (Frontend Setup)

```bash
cd frontend

# 1. تثبيت الحزم والمكتبات
npm install

# 2. تشغيل تطبيق أنجولار
npm start
```

* التطبيق يعمل على: `http://localhost:4200`

---

## 🔐 بيانات دخول لوحة تحكم الأدمن (Admin Credentials)

- **رابط لوحة التحكم:** [http://localhost:4200/admin/login](http://localhost:4200/admin/login)
- **البريد الإلكتروني:** `admin@store.com`
- **كلمة المرور:** `admin123`

---

## 🌍 دليل الرفع على السحابة (Cloud Deployment Guide)

### الخيار 1: الرفع على منصة Render.com (موصى به - مجاني ومستقر)

#### 🅰️ رفع الخلفية (Backend Deployment on Render):
1. قم برفع المشروع على حسابك في GitHub.
2. ادخل على [Render.com](https://render.com) وأنشئ **New Web Service**.
3. ربط المستودع وحدد مجلد الخلفية `backend`.
4. ضبط إعدادات الخدمة:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
5. إضافة متغيرات البيئة (Environment Variables):
   - `MONGODB_URI` = رابط قاعدة بياناتك في MongoDB Atlas
   - `JWT_SECRET` = مفتاح تشفير قوي (مثل `super_secret_jwt_key_2026`)
   - `ADMIN_EMAIL` = `admin@store.com`
   - `ADMIN_PASSWORD` = `admin123`
   - `STORE_WHATSAPP_NUMBER` = `201003794482`
6. بعد اكتمال الرفع احفظ رابط الخلفية (مثال: `https://my-store-backend.onrender.com`).

#### 🅱️ تعبئة قاعدة البيانات على السحابة (Run Seed on Production):
في منصة Render، افتح تبويب **Shell** واكتب:
```bash
cd backend && npm run seed
```

#### 🅲 رفع الواجهة الأمامية (Frontend Deployment on Render / Vercel):
1. افتح ملف `frontend/src/environments/environment.prod.ts` وضبط رابط الـ API:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://my-store-backend.onrender.com/api', // ضع رابط خلفيتك هنا
     whatsappNumber: '201003794482',
     currency: 'ج.م'
   };
   ```
2. في Render اختر **Static Site** (أو في Vercel / Netlify):
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist/frontend/browser` (أو `frontend/dist/frontend`)

---

### الخيار 2: الرفع على سيرفر خاص (VPS - Ubuntu + Nginx + PM2)

#### 1. تجهيز الخادم وتشغيل الـ Backend بواسطة PM2:
```bash
cd /var/www/vegetables-fruits-store/backend
npm install
npm run build
npm run seed
pm2 start dist/index.js --name "fresh-store-api"
pm2 save
```

#### 2. بناء الـ Frontend وتجهيز Nginx:
```bash
cd /var/www/vegetables-fruits-store/frontend
npm install
npm run build
```
ضبط إعدادات Nginx للتحويل وتخديم الملفات الثابتة والـ Proxy للـ API على البورت 5000.

---

## 📡 أهم نقاط الـ REST API (Endpoints)

| الوصف | المسار (Endpoint) | الطريقة (Method) | الحماية |
|---|---|---|---|
| جلب التصنيفات | `/api/categories` | `GET` | عام |
| جلب المنتجات (تصفية وبحث) | `/api/products` | `GET` | عام |
| تفاصيل منتج | `/api/products/:id` | `GET` | عام |
| إنشاء طلب جديد | `/api/orders` | `POST` | عام |
| تتبع طلب برقم الطلب | `/api/orders/track/:orderNumber` | `GET` | عام |
| تسجيل دخول الأدمن | `/api/auth/login` | `POST` | عام |
| إحصائيات لوحة التحكم | `/api/admin/dashboard/stats` | `GET` | أدمن (JWT) |
| إضافة / تعديل / حذف منتج | `/api/products` | `POST / PATCH / DELETE` | أدمن (JWT) |
| إضافة / تعديل / حذف تصنيف | `/api/categories` | `POST / PATCH / DELETE` | أدمن (JWT) |
| إدارة وتحديث حالات الطلبات | `/api/orders` | `GET / PATCH / DELETE` | أدمن (JWT) |

---

## 📄 الترخيص (License)
هذا المشروع متاح للاستخدام المفتوح والتطوير التجاري. 

صُنع بـ ❤️ لخدمة تجارة الخضار والفاكهة الطازجة في مصر.
