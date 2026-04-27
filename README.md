# CN230 MUVERSE

ระบบตลาดออนไลน์ (Marketplace) สำหรับซื้อขายสินค้าและบริการ ด้านตวามเชื่อ ผู้ใช้งานสามารถสลับบทบาทระหว่าง **Customer** และ **Seller** ได้ในบัญชีเดียว รองรับระบบ Wallet, การจัดการคำสั่งซื้อ, การรับงานบริการ (Requests) และการรีวิวผู้ขาย

**Live:** https://muverse-cn230-project.vercel.app/

---

## สมาชิกในกลุ่ม

| ชื่อ-นามสกุล | รหัสนักศึกษา |
|---|---|
| นายปัณณวิชญ์ สุทธิโมกข์  | 6710685030 |
| นายธีรสุต ชาติบัญชาชัย | 6710615136 |
| นายพิพัทธนชาติ คำมูลมาตย์ | 6710615151 |
| นายพิพัทธนชาติ คำมูลมาตย์ | 6710685071 |


---

## ภาพรวมระบบ

**ฟีเจอร์หลัก:**

| ฟีเจอร์ | คำอธิบาย |
|---|---|
| Booking / Request | ลูกค้าสร้าง request ระบุงานที่ต้องการและงบประมาณ |
| Order & Payment | ระบบ order และการยืนยันรับบริการ พร้อมโอนเงินให้ผู้ขาย |
| Review | ลูกค้าให้คะแนนและรีวิวผู้ขายหลังบริการเสร็จสิ้น |
| Categories | จัดหมวดหมู่บริการและประเภทงาน |
| File Upload | อัปโหลดรูปภาพผ่าน Supabase Storage |
| Authentication | สมัคร / เข้าสู่ระบบ ด้วย JWT + bcrypt |
| Role-based Access | แยกสิทธิ์ผู้ใช้ระหว่าง Customer, Seller และ Admin |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 · Express 4 |
| Database | PostgreSQL via Neon (serverless) |
| Storage | Supabase Storage (อัปโหลดรูปภาพ) |
| Auth | JWT + bcrypt |
| Frontend | HTML / CSS / Vanilla JS |
| Deploy | Vercel |

---

## โครงสร้างโปรเจกต์

```
cn230-muverse/
├── src/
│   ├── index.js                  # Entry point — สร้าง Express server
│   ├── config/
│   │   ├── db.js                 # เชื่อมต่อ Neon (PostgreSQL)
│   │   └── paths.js              # Static file paths
│   ├── models/                   # SQL queries         
│   │   ├── categoryModel.js
│   │   ├── serviceTypesModel.js
│   │   ├── orderModel.js
│   │   ├── orderItemModel.js
│   │   └── stockModel.js
│   ├── controllers/              # Business logic     
│   │   ├── categoriesController.js
│   │   ├── customerController.js
│   │   └── serviceTypesController.js
│   ├── routes/                   # API routing    
│   │   ├── categoriesRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── serviceTypesRoutes.js
│   │   └── uploadRoutes.js
│   └── middleware/
│       └── errorHandler.js
├── public/
│   ├── pages/                    # HTML pages
│   ├── function/                 # Frontend JS (booking, wallet ฯลฯ)
│   ├── css/
│   └── assets/
├── .env                          # Environment variables (ห้าม commit) 
├── vercel.json
└── package.json
```
---

---

## วิธีติดตั้ง 
### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd done
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค แล้วใส่ค่าดังนี้

```env
DATABASE_URL= your_neondb_connection_string
SUPABASE_URL= your_supabase_url
SUPABASE_SERVICE_ROLE_KEY = your_supabase_anon_key
PORT=3000
```
your_neondb_connection_string เอาจาก neon.tech สร้างโปรเจคแล้วนำ connection string มาใช้
your_supabase_url             เอาจาก supabase สร้างโปรเจคแล้วนำ สร้างโปรเจค url มาใช้
your_supabase_anon_key        ใน setting ของ supabase จะมี anon key ให้เอาส่วนนั้นมาใช้

สร้าง bucket ใน storage supabase ชื่อ stock 

### 4. สร้างตารางใน Database

```bash
npm run db:init
```

### 5. (Optional) เพิ่มข้อมูลตัวอย่าง

```bash
npm run db:seed
```

---

## วิธีรัน (Run)

### Development (auto-restart)
```bash
npm run dev
```

### Production
```bash
npm start
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

---

## API Endpoints หลักบางส่วน 

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/api/user/auth` | Login |
| GET | `/api/stock` | ดูสินค้าทั้งหมด |
| POST | `/api/order/buy` | สั่งซื้อสินค้า |
| GET | `/api/request` | ดู requests ทั้งหมด |
| POST | `/api/review` | รีวิวผู้ขาย |
| GET | `/api/wallet/balance/:id` | ดูยอดเงิน |

================================================
SQL script สำหรับสร้างตาราง และ ข้อมูลตัวอย่าง
================================================
```bash
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE account_wallet (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

CREATE TYPE payment_type_enum AS ENUM ('DEPOSIT', 'WITHDRAW', 'PAYMENT', 'INCOME', 'REFUND');
CREATE TABLE record_wallet (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_wallet(account_id) ON DELETE CASCADE,
    payment_type payment_type_enum NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    customer_status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sellers (
    seller_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    shop_name VARCHAR(255),
    rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    seller_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE service_types (
    service_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE stocks (
    stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    item_type VARCHAR(50) NOT NULL DEFAULT 'physical',
    stock_status VARCHAR(20) NOT NULL DEFAULT 'available',
    url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id),
    seller_id UUID NOT NULL REFERENCES users(user_id),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    total_price NUMERIC(12,2) NOT NULL,
    order_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
);

CREATE TABLE order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    item_quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id),
    seller_id UUID REFERENCES users(user_id),
    service_type_id UUID REFERENCES service_types(service_type_id) ON DELETE SET NULL,
    request_title VARCHAR(255) NOT NULL,
    request_detail TEXT,
    budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    locked_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    request_status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(request_id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES users(user_id),
    seller_id UUID NOT NULL REFERENCES sellers(seller_id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CREATE TYPE payment_type_enum AS ENUM ('DEPOSIT', 'WITHDRAW', 'PAYMENT', 'INCOME', 'REFUND');

INSERT INTO users (name, email, password_hash, phone, role, status) VALUES
('NUT', 'somchai@example.com', 'a123', '0812345678', 'customer', 'active'),
('GJ', 'somying@example.com', 'b456', '0898765432', 'seller', 'active'),
('FAN', 'admin@muverse.com', '$c789', '0800000001', 'admin', 'active');

INSERT INTO categories (name) VALUES
('วอลเปเปอร์มงคล'),
('บริการรับทำพิธี');

INSERT INTO sellers (user_id, shop_name, rating, seller_status) VALUES
('uuid-user-1', 'ร้านมูเตลู GJ', 4.50, 'verified');

INSERT INTO account_wallet (user_id, wallet) VALUES
('uuid-user-1', 500.00),
('uuid-user-2', 1200.00);

INSERT INTO stocks (seller_id, category_id, item_name, description, price, stock_quantity, stock_status) VALUES
('uuid-seller-1', 'uuid-category-1', 'วอลเปเปอร์มังกรทอง', 'ภาพมงคลเสริมดวง', 99.00, 999, 'available'),
('uuid-seller-1', 'uuid-category-2', 'ชุดพิธีตักบาตรออนไลน์', 'รับจ้างตักบาตรแทน 1 ครั้ง', 250.00, 50, 'available');

INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status) VALUES
('uuid-account_id-1', 'DEPOSIT', 500.00, 'PromptPay', 'SUCCESS'),
(''uuid-account_id-1', 'PAYMENT', 99.00, 'wallet', 'SUCCESS'),
(''uuid-account_id-2, 'DEPOSIT', 1200.00, 'Credit Card', 'SUCCESS');
```