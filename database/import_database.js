/**
 * Script for importing / restoring database from JSON files to MongoDB.
 * Usage:
 *   1. Make sure MongoDB connection string is in ../backend/.env or pass as argument
 *   2. Run: node import_database.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Try loading .env from backend/.env or root
const envPathBackend = path.join(__dirname, '../backend/.env');
const envPathRoot = path.join(__dirname, '../.env');
if (fs.existsSync(envPathBackend)) {
    require('dotenv').config({ path: envPathBackend });
} else if (fs.existsSync(envPathRoot)) {
    require('dotenv').config({ path: envPathRoot });
} else {
    require('dotenv').config();
}

const MONGO_URI = process.env.MONGO_URI || process.argv[2] || 'mongodb://localhost:27017/computer_store';

async function importDatabase() {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // Read JSON files
    const productsPath = path.join(__dirname, 'products.json');
    const usersPath = path.join(__dirname, 'users.json');
    const ordersPath = path.join(__dirname, 'orders.json');

    if (fs.existsSync(productsPath)) {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        await db.collection('products').deleteMany({});
        if (products.length > 0) {
            await db.collection('products').insertMany(products);
        }
        console.log(`✓ Restored ${products.length} products`);
    }

    if (fs.existsSync(usersPath)) {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        await db.collection('users').deleteMany({});
        if (users.length > 0) {
            await db.collection('users').insertMany(users);
        }
        console.log(`✓ Restored ${users.length} users`);
    }

    if (fs.existsSync(ordersPath)) {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        await db.collection('orders').deleteMany({});
        if (orders.length > 0) {
            await db.collection('orders').insertMany(orders);
        }
        console.log(`✓ Restored ${orders.length} orders`);
    }

    console.log('Database import completed successfully!');
    await mongoose.connection.close();
}

importDatabase().catch(err => {
    console.error('Import error:', err);
    process.exit(1);
});
