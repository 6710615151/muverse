# CN230 MUVERSE

ระบบ Marketplace สำหรับซื้อ-ขายบริการดิจิทัล พัฒนาในวิชา CN230

**Live:** https://muverse-cn230-project.vercel.app/

---

## สมาชิกในกลุ่ม

| ชื่อ-นามสกุล | รหัสนักศึกษา |
|---|---|
| ชื่อ นามสกุล | 67XXXXXXX |
| ชื่อ นามสกุล | 67XXXXXXX |
| ชื่อ นามสกุล | 67XXXXXXX |

---

## ภาพรวมระบบ

MUVERSE เป็นแพลตฟอร์มที่เชื่อมระหว่าง **ผู้ซื้อ (Customer)** และ **ผู้ขาย (Seller)** บริการดิจิทัล เช่น งานออกแบบ งานเขียน หรืองาน freelance ทั่วไป

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
│   │   ├── aModel.js             # ตัวอย่าง
│   │   ├── categoryModel.js
│   │   ├── serviceTypesModel.js
│   │   ├── orderModel.js
│   │   ├── orderItemModel.js
│   │   └── stockModel.js
│   ├── controllers/              # Business logic
│   │   ├── aController.js        # ตัวอย่าง
│   │   ├── categoriesController.js
│   │   ├── customerController.js
│   │   └── serviceTypesController.js
│   ├── routes/                   # API routing
│   │   ├── aRoutes.js            # ตัวอย่าง
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
├── scripts/
│   ├── initDb.js                 # สร้างตารางในฐานข้อมูล
│   └── seedDb.js                 # เพิ่มข้อมูลตัวอย่าง
├── .env                          # Environment variables (ห้าม commit)
├── vercel.json
└── package.json
```

---

## ติดตั้งและรัน

### 1. Clone และติดตั้ง dependencies
```bash
git clone <repo-url> cn230-muverse
cd cn230-muverse
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` แล้วใส่ค่าต่อไปนี้:
```env
DATABASE_URL=<Neon connection string>
SUPABASE_URL=<Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
PORT = 3000
```

### 3. สร้างตารางในฐานข้อมูล (ครั้งแรกเท่านั้น)
```bash
npm run db:init
```

### 4. เพิ่มข้อมูลตัวอย่าง (optional)
```bash
npm run db:seed
```

### 5. รัน
```bash
npm run dev    # development (auto-reload ด้วย nodemon)
npm start      # production
```
เปิด http://localhost:3000

---

