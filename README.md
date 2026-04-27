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
SUPABASE_KEY= your_supabase_anon_key
PORT=3000
```

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