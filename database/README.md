# 📦 คู่มือฐานข้อมูล (Database Documentation) - TechGear Store

เอกสารนี้จัดทำขึ้นเพื่ออธิบายโครงสร้างฐานข้อมูล และวิธีการนำเข้า/ส่งออกข้อมูล (Database Export & Import) สำหรับตรวจงานและส่งอาจารย์

---

## 📑 1. รายการไฟล์ข้อมูลในโฟลเดอร์ `database/`

| ชื่อไฟล์ | รูปแบบ | รายละเอียด |
| :--- | :--- | :--- |
| **`database_export.json`** | JSON | ไฟล์ข้อมูลรวมทุก Collection (Products, Users, Orders) พร้อม Metadata วันเวลาที่ส่งออก |
| **`products.json`** | JSON | ข้อมูลสินค้าทั้งหมด **117 รายการ** (หมวดหมู่ โน้ตบุ๊ก, ชิ้นส่วนคอม, คอมประกอบ, ดีลพิเศษ) |
| **`users.json`** | JSON | ข้อมูลผู้ใช้งานในระบบ (บัญชีผู้ใช้, ข้อมูลส่วนตัว, รหัสผ่านที่เข้ารหัส bcrypt, รูปโปรไฟล์) |
| **`orders.json`** | JSON | ข้อมูลคำสั่งซื้อ (เลขออเดอร์, วันที่, ยอดชำระ, สถานะคำสั่งซื้อ, รายการสินค้า) |
| **`database_dump.sql`** | SQL | ไฟล์ SQL Dump สำหรับอาจารย์ที่ต้องการนำเข้าผ่าน **MySQL / phpMyAdmin / PostgreSQL** |
| **`import_database.js`** | JavaScript (Node.js) | สคริปต์สำหรับ Restore/Import ข้อมูลกลับเข้า MongoDB อัตโนมัติ |

---

## 🗄️ 2. โครงสร้างฐานข้อมูล (Collections & Schemas)

### 2.1 Collection: `products` (สินค้า)
- `id` (String): รหัสสินค้า (เช่น "1", "2")
- `title_en` (String): ชื่อสินค้าภาษาอังกฤษ
- `title_th` (String): ชื่อสินค้าภาษาไทย
- `desc_en` (String): รายละเอียดสเปกสินค้าภาษาอังกฤษ
- `desc_th` (String): รายละเอียดสเปกสินค้าภาษาไทย
- `price` (Number): ราคาสินค้า (บาท)
- `category` (String): หมวดหมู่สินค้า (`laptops`, `components`, `prebuilds`, `deals`)
- `icon` (String): เส้นทางไฟล์รูปภาพ (เช่น `images/001-asus-vivobook-15-x1504va.jpg`)

### 2.2 Collection: `users` (ผู้ใช้งาน)
- `username` (String): ชื่อผู้ใช้ / อีเมลสำหรับเข้าสู่ระบบ (Unique)
- `name` (String): ชื่อ-นามสกุล หรือชื่อที่แสดง
- `email` (String): อีเมลผู้ใช้
- `password` (String): รหัสผ่านที่เข้ารหัสปลอดภัยด้วย **bcrypt**
- `phone` (String): เบอร์โทรศัพท์
- `address` (String): ที่อยู่จัดส่ง
- `avatar` (String / Base64): รูปโปรไฟล์ของผู้ใช้
- `cart` (Array): ตะกร้าสินค้าของผู้ใช้

### 2.3 Collection: `orders` (คำสั่งซื้อ)
- `id` (String): รหัสคำสั่งซื้อ (เช่น "ORD342526")
- `username` (String): บัญชีผู้สั่งซื้อ
- `date` (Date / ISODate): วันเวลาที่ทำการสั่งซื้อ
- `total` (Number): ยอดรวมราคาสินค้า (บาท)
- `status` (String): สถานะคำสั่งซื้อ (`Confirmed`, `Pending` ฯลฯ)
- `address` (String): ที่อยู่จัดส่งที่ระบุตอนสั่งซื้อ
- `payment` (String): ช่องทางการชำระเงิน (เช่น `promptpay`, `cod`, `card`)
- `items` (Array): รายการสินค้าที่สั่งซื้อพร้อมจำนวนและราคาต่อชิ้น

---

## 🚀 3. วิธีการ Restore / นำเข้าข้อมูล (Database Import)

### วิธีที่ 1: ใช้ Node.js Script (แนะนำสำหรับ MongoDB)
ตรวจสอบว่ามีการติดตั้ง Node.js และแพ็กเกจแล้ว จากนั้นรันคำสั่ง:
```bash
# นำเข้าตามค่าใน backend/.env (MongoDB Atlas หรือ Local)
node database/import_database.js

# หรือระบุ MongoDB URI ที่ต้องการนำเข้าโดยตรง:
node database/import_database.js "mongodb://localhost:27017/computer_store"
```

### วิธีที่ 2: นำเข้าผ่าน MongoDB Compass หรือ mongoimport
สามารถเปิดโปรแกรม **MongoDB Compass** แล้วกด **Add Data** -> **Import JSON** โดยเลือกไฟล์:
- `products.json` เข้า collection `products`
- `users.json` เข้า collection `users`
- `orders.json` เข้า collection `orders`

### วิธีที่ 3: นำเข้าสู่ MySQL / phpMyAdmin (ใช้ไฟล์ SQL)
หากอาจารย์ใช้ฐานข้อมูลเชิงสัมพันธ์ (RDBMS) เช่น MySQL:
1. เปิด **phpMyAdmin** หรือ **MySQL Workbench**
2. เลือกแท็บ **Import**
3. เลือกไฟล์ `database/database_dump.sql` แล้วกด **Execute / Go**
