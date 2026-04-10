# CN230 MUVerse 

ระบบฐานข้อมูลสำหรับวิชา CN230 
**Tech Stack:** Node.js · Express · PostgreSQL (Neon) · HTML/CSS/JS · Vercel

---

## โครงสร้างโปรเจ็ค

```
cn230-muverse/
├── src/
│   ├── index.js               # Entry point (import only)
│   ├── config/
│   │   ├── db.js              # Neon database connection
│   │   └── paths.js           # Static file paths
│   ├── routes/
│   │   ├── studentRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   └── pageRoutes.js
│   ├── controllers/
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   └── enrollmentController.js
│   ├── models/
│   │   ├── studentModel.js    # SQL queries for students
│   │   ├── courseModel.js     # SQL queries for courses
│   │   └── enrollmentModel.js # SQL queries + advanced JOIN/GPA
│   └── middleware/
│       └── errorHandler.js
├── public/
│   ├── css/main.css
│   ├── js/
│   │   ├── api.js             # API fetch helpers
│   │   ├── ui.js              # Shared UI utilities
│   │   ├── students.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   └── reports.js
│   └── pages/
│       ├── index.html         # Dashboard
│       ├── students.html
│       ├── courses.html
│       ├── enrollments.html
│       └── reports.html
├── scripts/
│   ├── initDb.js              # CREATE TABLE
│   ├── seedDb.js              # INSERT sample data
│   └── resetDb.js             # DROP + recreate
├── vercel.json
├── package.json
└── .env.example
```

---

## วิธีติดตั้งและรัน

### 1. Clone และติดตั้ง dependencies
```bash
git clone <repo-url>
cd cn230-muverse
npm install
```

### 2. ตั้งค่า Environment Variable
```bash
cp .env.example .env
# แก้ไข DATABASE_URL ใน .env ด้วย connection string จาก Neon
```

### 3. สร้างตารางในฐานข้อมูล
```bash
npm run db:init
```

### 4. เพิ่มข้อมูลตัวอย่าง (optional)
```bash
npm run db:seed
```

### 5. รันในเครื่อง
```bash
npm run dev    # development (nodemon)
npm start      # production
```
เปิด http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/students` | ดึงนักศึกษาทั้งหมด |
| GET    | `/api/students/:id` | ดึงนักศึกษาตาม ID |
| GET    | `/api/students/search?q=` | ค้นหานักศึกษา |
| POST   | `/api/students` | เพิ่มนักศึกษา |
| PUT    | `/api/students/:id` | แก้ไขนักศึกษา |
| DELETE | `/api/students/:id` | ลบนักศึกษา |
| GET    | `/api/courses` | ดึงรายวิชาทั้งหมด |
| POST   | `/api/courses` | เพิ่มรายวิชา |
| GET    | `/api/enrollments` | ดึงการลงทะเบียนทั้งหมด |
| POST   | `/api/enrollments` | ลงทะเบียน |
| PATCH  | `/api/enrollments/:id/grade` | อัปเดตเกรด |
| GET    | `/api/enrollments/reports/gpa` | รายงาน GPA (JOIN + CASE) |
| GET    | `/api/enrollments/reports/courses` | สถิติรายวิชา |

---

## Database Schema

```sql
students (student_id PK, name, major, year, created_at, updated_at)
courses  (course_id PK, course_name, credits, instructor, department, ...)
enrollments (id PK, student_id FK, course_id FK, semester, grade, enrolled_at)
             UNIQUE (student_id, course_id, semester)
```
