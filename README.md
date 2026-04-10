# CN230 MUVERSE
ระบบฐานข้อมูลสำหรับวิชา CN230
**Tech Stack:** Node.js · Express · PostgreSQL (Neon) · HTML/CSS/JS · Vercel
---

## WEBSITE
---
https://muverse-cn230-project.vercel.app/

---

## วิธีติดตั้งและรัน

### 1. Clone และติดตั้ง dependencies
```bash
git clone <repo-url> cn230-muverse
cd cn230-muverse
npm install
```
### 2. ตั้งค่า Environment Variable
```bash
cp .env.example .env
# แก้ไข DATABASE_URL ใน .env ด้วย connection string จาก Neon
```
### 3.กรณีฐานข้อมูลไม่มี
#### 3.1 สร้างตารางในฐานข้อมูล
```bash
npm run db:init
```
#### 3.2 เพิ่มข้อมูลตัวอย่าง (optional)
```bash
npm run db:seed
```
### 5. รันในเครื่อง
```bash
npm run dev    # development (nodemon)
npm start      # production
```
เปิด http://localhost:3000


---

