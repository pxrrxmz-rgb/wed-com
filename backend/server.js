const path = require('path');
const fs = require('fs');

// Ensure .env is loaded from backend/.env or root
const envPath = fs.existsSync(path.join(__dirname, '.env'))
    ? path.join(__dirname, '.env')
    : path.join(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
// Serve frontend - works both locally and on Railway
const frontendPath = path.join(__dirname, '../wed com');
const frontendPathAlt = path.join(__dirname, '../frontend');
const staticPath = fs.existsSync(frontendPath) ? frontendPath : frontendPathAlt;
app.use(express.static(staticPath));

// Connect to MongoDB
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.error('MONGO_URI is not set in environment or .env file!');
}

app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({ status: 'ok', db: states[dbState] || dbState, env: !!process.env.MONGO_URI });
});

// --- PRODUCTS API ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// --- AUTH API ---

// --- Admin API ---
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


// --- Order API ---
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.patch('/api/orders/:id/confirm', async (req, res) => {
    try {
        const updated = await Order.findOneAndUpdate({ id: req.params.id }, { status: 'Confirmed' }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});


// --- Order History by User ---
app.get('/api/orders/user/:username', async (req, res) => {
    try {
        const orders = await Order.find({ username: req.params.username }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

// --- User API ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            name: name || username,
            email: username,
            password: hashedPassword,
            cart: []
        });

        await newUser.save();
        res.json({
            message: 'User registered successfully',
            username: newUser.username,
            name: newUser.name || newUser.username,
            email: newUser.email || newUser.username,
            phone: newUser.phone || '',
            address: newUser.address || '',
            avatar: newUser.avatar || null,
            cart: newUser.cart || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            username: user.username,
            name: user.name || user.username,
            email: user.email || user.username,
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || null,
            cart: user.cart || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Update Profile
app.put('/api/user/:username', async (req, res) => {
    try {
        const { name, phone, address, avatar, password } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updated = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: updateData },
            { new: true, upsert: true }
        );
        res.json({
            message: 'Profile updated successfully',
            user: {
                username: updated.username,
                name: updated.name,
                email: updated.email || updated.username,
                phone: updated.phone || '',
                address: updated.address || '',
                avatar: updated.avatar || null
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- CART API ---
app.get('/api/cart/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

app.post('/api/cart/:username', async (req, res) => {
    try {
        const { cart } = req.body;
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.cart = cart;
        await user.save();
        res.json({ message: 'Cart updated', cart: user.cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
