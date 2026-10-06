const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const outputDir = path.join(__dirname, '../database');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'object') {
        return "'" + JSON.stringify(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
            switch (char) {
                case "\0": return "\\0";
                case "\x08": return "\\b";
                case "\x09": return "\\t";
                case "\x1a": return "\\z";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%": return "\\" + char;
                default: return char;
            }
        }) + "'";
    }
    return "'" + String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
        switch (char) {
            case "\0": return "\\0";
            case "\x08": return "\\b";
            case "\x09": return "\\t";
            case "\x1a": return "\\z";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%": return "\\" + char;
            default: return char;
        }
    }) + "'";
}

async function exportDatabase() {
    console.log('Connecting to MongoDB Atlas...');
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is missing in .env');
    }

    await mongoose.connect(uri);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // Fetch collections
    const products = await db.collection('products').find({}).toArray();
    const users = await db.collection('users').find({}).toArray();
    const orders = await db.collection('orders').find({}).toArray();

    console.log(`Fetched: ${products.length} products, ${users.length} users, ${orders.length} orders`);

    // 1. Individual JSON files
    fs.writeFileSync(path.join(outputDir, 'products.json'), JSON.stringify(products, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'orders.json'), JSON.stringify(orders, null, 2), 'utf-8');

    // 2. Full combined export JSON
    const combinedExport = {
        metadata: {
            databaseName: 'computer_store',
            exportedAt: new Date().toISOString(),
            system: 'TechGear Computer Store',
            totalCollections: 3,
            counts: {
                products: products.length,
                users: users.length,
                orders: orders.length
            }
        },
        collections: {
            products,
            users,
            orders
        }
    };
    fs.writeFileSync(path.join(outputDir, 'database_export.json'), JSON.stringify(combinedExport, null, 2), 'utf-8');

    // 3. Generate SQL dump for professors / SQL submission
    let sqlContent = `-- ========================================================\n`;
    sqlContent += `-- Database Dump for TechGear Computer Store\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database Engine: MySQL / PostgreSQL Compatible\n`;
    sqlContent += `-- ========================================================\n\n`;

    sqlContent += `CREATE DATABASE IF NOT EXISTS \`computer_store\`;\n`;
    sqlContent += `USE \`computer_store\`;\n\n`;

    // Products table SQL
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `-- Table structure for table \`products\`\n`;
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `DROP TABLE IF EXISTS \`products\`;\n`;
    sqlContent += `CREATE TABLE \`products\` (\n`;
    sqlContent += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sqlContent += `  \`title_en\` VARCHAR(255) NOT NULL,\n`;
    sqlContent += `  \`title_th\` VARCHAR(255) NOT NULL,\n`;
    sqlContent += `  \`desc_en\` TEXT,\n`;
    sqlContent += `  \`desc_th\` TEXT,\n`;
    sqlContent += `  \`price\` DECIMAL(10, 2) NOT NULL,\n`;
    sqlContent += `  \`category\` VARCHAR(100) NOT NULL,\n`;
    sqlContent += `  \`icon\` VARCHAR(255)\n`;
    sqlContent += `);\n\n`;

    sqlContent += `-- Dumping data for table \`products\`\n`;
    if (products.length > 0) {
        for (const p of products) {
            sqlContent += `INSERT INTO \`products\` (\`id\`, \`title_en\`, \`title_th\`, \`desc_en\`, \`desc_th\`, \`price\`, \`category\`, \`icon\`) VALUES (${escapeSql(p.id)}, ${escapeSql(p.title_en)}, ${escapeSql(p.title_th)}, ${escapeSql(p.desc_en)}, ${escapeSql(p.desc_th)}, ${p.price || 0}, ${escapeSql(p.category)}, ${escapeSql(p.icon)});\n`;
        }
    }
    sqlContent += `\n`;

    // Users table SQL
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `-- Table structure for table \`users\`\n`;
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `DROP TABLE IF EXISTS \`users\`;\n`;
    sqlContent += `CREATE TABLE \`users\` (\n`;
    sqlContent += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sqlContent += `  \`username\` VARCHAR(255) NOT NULL UNIQUE,\n`;
    sqlContent += `  \`name\` VARCHAR(255),\n`;
    sqlContent += `  \`email\` VARCHAR(255),\n`;
    sqlContent += `  \`password\` VARCHAR(255) NOT NULL,\n`;
    sqlContent += `  \`phone\` VARCHAR(50),\n`;
    sqlContent += `  \`address\` TEXT,\n`;
    sqlContent += `  \`avatar\` LONGTEXT,\n`;
    sqlContent += `  \`cart\` LONGTEXT\n`;
    sqlContent += `);\n\n`;

    sqlContent += `-- Dumping data for table \`users\`\n`;
    if (users.length > 0) {
        for (const u of users) {
            const uid = u._id ? u._id.toString() : (u.id || u.username);
            sqlContent += `INSERT INTO \`users\` (\`id\`, \`username\`, \`name\`, \`email\`, \`password\`, \`phone\`, \`address\`, \`avatar\`, \`cart\`) VALUES (${escapeSql(uid)}, ${escapeSql(u.username)}, ${escapeSql(u.name || null)}, ${escapeSql(u.email || null)}, ${escapeSql(u.password)}, ${escapeSql(u.phone || null)}, ${escapeSql(u.address || null)}, ${escapeSql(u.avatar || null)}, ${escapeSql(JSON.stringify(u.cart || []))});\n`;
        }
    }
    sqlContent += `\n`;

    // Orders table SQL
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `-- Table structure for table \`orders\`\n`;
    sqlContent += `-- --------------------------------------------------------\n`;
    sqlContent += `DROP TABLE IF EXISTS \`orders\`;\n`;
    sqlContent += `CREATE TABLE \`orders\` (\n`;
    sqlContent += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sqlContent += `  \`username\` VARCHAR(255),\n`;
    sqlContent += `  \`date\` DATETIME,\n`;
    sqlContent += `  \`total\` DECIMAL(10, 2) NOT NULL,\n`;
    sqlContent += `  \`status\` VARCHAR(50),\n`;
    sqlContent += `  \`address\` TEXT,\n`;
    sqlContent += `  \`payment\` VARCHAR(50),\n`;
    sqlContent += `  \`items\` LONGTEXT\n`;
    sqlContent += `);\n\n`;

    sqlContent += `-- Dumping data for table \`orders\`\n`;
    if (orders.length > 0) {
        for (const o of orders) {
            const dateStr = o.date ? new Date(o.date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
            sqlContent += `INSERT INTO \`orders\` (\`id\`, \`username\`, \`date\`, \`total\`, \`status\`, \`address\`, \`payment\`, \`items\`) VALUES (${escapeSql(o.id)}, ${escapeSql(o.username || null)}, '${dateStr}', ${o.total || 0}, ${escapeSql(o.status)}, ${escapeSql(o.address || null)}, ${escapeSql(o.payment || null)}, ${escapeSql(JSON.stringify(o.items || []))});\n`;
        }
    }
    sqlContent += `\n`;

    fs.writeFileSync(path.join(outputDir, 'database_dump.sql'), sqlContent, 'utf-8');

    console.log('Database export completed successfully into folder:', outputDir);
    await mongoose.connection.close();
}

exportDatabase().catch(err => {
    console.error('Export error:', err);
    process.exit(1);
});
