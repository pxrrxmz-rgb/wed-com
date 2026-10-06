# 💻 TechGear - E-Commerce Computer Store

ระบบเว็บไซต์ร้านค้าออนไลน์จำหน่ายอุปกรณ์คอมพิวเตอร์และโน้ตบุ๊ก (Full-Stack Web Application)  
พัฒนาด้วย **Node.js, Express, MongoDB (Mongoose)** และ **Frontend (HTML5, Modern CSS Glassmorphism, Vanilla JavaScript)**

🌐 **ลิงก์เว็บไซต์ออนไลน์ (Live Demo บน Railway):**  
👉 [https://wed-com-production.up.railway.app](https://wed-com-production.up.railway.app)

---

## 🌟 ฟังก์ชันหลักของระบบ (Features)

1. **หน้าร้านค้าและแสดงสินค้า (Product Catalog & Shop)**
   - แสดงรายการสินค้ามากกว่า 117 รายการ แยกตามหมวดหมู่ (Laptops, Components, Prebuilds, Deals)
   - ค้นหาสินค้า และระบบกรองสินค้าตามหมวดหมู่
   - แสดงราคาสินค้า, รูปภาพ, รายละเอียดสเปกภาษาไทยและภาษาอังกฤษ

2. **ระบบตะกร้าสินค้าและการสั่งซื้อ (Shopping Cart & Checkout)**
   - เพิ่ม/ลด/ลบ สินค้าในตะกร้า คำนวณยอดเงินรวมและภาษีอัตโนมัติ
   - หน้าชำระเงินรองรับหลายรูปแบบ (QR PromptPay พร้อมคิวอาร์โค้ด, ชำระเงินปลายทาง COD, บัตรเครดิต)
   - บันทึกคำสั่งซื้อลงฐานข้อมูล MongoDB และแสดงผลในประวัติ

3. **ระบบสมาชิกและโปรไฟล์ผู้ใช้ (Authentication & User Profile)**
   - สมัครสมาชิก (เมื่อสมัครเสร็จเข้าสู่ระบบทันทีโดยไม่ต้องกรอกซ้ำ)
   - เข้าสู่ระบบด้วย **Username หรือ Email**
   - ปุ่มเปิด/ปิด ดูรหัสผ่าน (Show/Hide Password toggle)
   - ฟังก์ชัน **จดจำรหัสผ่าน (Remember Me)**
   - เข้ารหัสความปลอดภัยรหัสผ่านด้วย **bcrypt**
   - หน้าแก้ไขโปรไฟล์ผู้ใช้ รองรับการอัปโหลดและบันทึกรูปโปรไฟล์ (Avatar) เก็บลงฐานข้อมูลถาวร

4. **ระบบจัดการสำหรับผู้ดูแลระบบ (Admin Dashboard)**
   - เข้าสู่ระบบ Admin ด้วยรหัสผ่าน: `admin1234`
   - จัดการสินค้า (CRUD): เพิ่มสินค้าใหม่, แก้ไขข้อมูล/ราคา, ลบสินค้า
   - จัดการคำสั่งซื้อ (Order Management): ดูรายการสั่งซื้อทั้งหมดของลูกค้า และกดปุ่มยืนยันคำสั่งซื้อ (Confirm Order)

5. **ระบบ 2 ภาษา (Bilingual Support - Thai / English)**
   - สลับภาษา ไทย/อังกฤษ ได้ทุกหน้า (หน้าร้านค้า, โปรไฟล์, หน้าระบบแอดมิน)
   - จัดเก็บภาษาที่เลือกไว้ใน LocalStorage จดจำสถานะผู้ใช้งาน

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── backend/                       # โค้ดฝั่งเซิร์ฟเวอร์ (API Backend)
│   ├── models/                    # โครงสร้าง Mongoose Schema
│   │   ├── Product.js             # Schema ข้อมูลสินค้า
│   │   ├── User.js                # Schema ข้อมูลผู้ใช้
│   │   └── Order.js               # Schema ข้อมูลคำสั่งซื้อ
│   ├── .env                       # ตั้งค่าพอร์ตและ MongoDB Connection String
│   ├── package.json               # รายการ Dependencies ฝั่ง Backend
│   ├── server.js                  # Express API Server
│   └── seed.js                    # สคริปต์ตั้งต้นข้อมูลสินค้า
├── database/                      # 🗄️ ไฟล์ฐานข้อมูลสำหรับส่งอาจารย์
│   ├── database_export.json       # ข้อมูล Export รวมทุก Collection
│   ├── products.json              # ข้อมูลสินค้า 117 ชิ้น (JSON)
│   ├── users.json                 # ข้อมูลผู้ใช้งาน (JSON)
│   ├── orders.json                # ข้อมูลคำสั่งซื้อ (JSON)
│   ├── database_dump.sql          # ข้อมูลสำหรับนำเข้า MySQL / phpMyAdmin (SQL)
│   ├── import_database.js         # สคริปต์นำเข้าข้อมูลลง MongoDB
│   └── README.md                  # คู่มือรายละเอียดฐานข้อมูล
├── wed com/                       # โค้ดฝั่งหน้าเว็บ (Frontend UI)
│   ├── index.html                 # หน้าแรกของเว็บไซต์
│   ├── shop.html                  # หน้าร้านค้า / หมวดหมู่สินค้า
│   ├── checkout.html              # หน้าชำระเงิน
│   ├── login.html                 # หน้าเข้าสู่ระบบและสมัครสมาชิก
│   ├── profile.html               # หน้าโปรไฟล์และแก้ไขข้อมูลส่วนตัว
│   ├── admin.html                 # แดชบอร์ดผู้ดูแลระบบ
│   ├── images/                    # รูปภาพสินค้าและไอคอน
│   ├── *.css                      # ไฟล์ตกแต่ง Glassmorphism
│   └── *.js                       # การทำงานฝั่ง Frontend
├── package.json                   # รูทโปรเจกต์
└── README.md                      # เอกสารประกอบการส่งงานฉบับนี้
```

---

## 🛠️ วิธีการรันโปรเจกต์ในเครื่อง (How to Run Locally)

### ข้อกำหนดก่อนติดตั้ง:
- ติดตั้ง [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)

### ขั้นตอนการรัน:
1. แตกไฟล์ ZIP
2. เปิด Command Prompt หรือ PowerShell ในโฟลเดอร์โปรเจกต์
3. ติดตั้ง Dependencies:
   ```bash
   cd backend
   npm install
   ```
4. เริ่มต้นการทำงานของเซิร์ฟเวอร์:
   ```bash
   npm start
   ```
   หรือ
   ```bash
   node server.js
   ```
5. เปิดเว็บเบราว์เซอร์แล้วเข้าใช้งานที่:
   ```text
   http://localhost:3000
   ```

---

## 🔑 ข้อมูลเข้าสู่ระบบสำหรับทดสอบ (Test Credentials)

- **เข้าสู่ระบบผู้ใช้ทั่วไป (Customer Account):**
  - Email / Username: `phongsak9485@gmail.com`
  - รหัสผ่าน: `123456`
  *(หรือสามารถกดสมัครบัญชีใหม่ได้ทันทีผ่านหน้าเว็บ)*
- **เข้าสู่ระบบแอดมิน (Admin Passcode):**
  - ลิงก์: `http://localhost:3000/admin.html`
  - รหัสผ่าน: `admin1234`
