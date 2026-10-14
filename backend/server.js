const path = require('path');
const fs = require('fs');

// Load .env from backend/.env or root
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
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Helper: Escape regex special characters for case-insensitive matching
function escapeRegex(str = '') {
    return String(str).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findUserQuery(identifier = '') {
    const exactRegex = new RegExp(`^${escapeRegex(identifier)}$`, 'i');
    return { $or: [{ username: exactRegex }, { email: exactRegex }] };
}

// Serve static frontend files safely
const frontendPath = path.join(__dirname, '../wed com');
const frontendPathAlt = path.join(__dirname, '../frontend');
const staticPath = fs.existsSync(frontendPath) ? frontendPath : frontendPathAlt;

// Block access to internal fix scripts or backend files inside static folder
app.use((req, res, next) => {
    if (/^\/(fix|update|rewrite|extract|create_product_page|add_products|backend)/i.test(req.path)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
});
app.use(express.static(staticPath));

// Connect to MongoDB
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log('Connected to MongoDB');
            // Auto-fix Product 101 if title_en was accidentally saved as "Test Update"
            await Product.updateOne(
                { id: '101', title_en: 'Test Update' },
                { $set: { title_en: 'JIB Maru Ryzen 5 5500 / RTX 5060' } }
            ).catch(() => {});
        })
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
        // Sort numerically by id if possible
        products.sort((a, b) => (parseInt(a.id, 10) || 9999) - (parseInt(b.id, 10) || 9999));
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

// --- ADMIN PRODUCTS API ---
app.post('/api/products', async (req, res) => {
    try {
        const body = { ...req.body };
        if (!body.id) {
            const allProducts = await Product.find({}, { id: 1 });
            const maxId = allProducts.reduce((max, p) => Math.max(max, parseInt(p.id, 10) || 0), 0);
            body.id = String(maxId + 1);
        }
        const title = body.title_th || body.title_en || body.title || 'New Product';
        const desc = body.desc_th || body.desc_en || body.desc || '';
        body.title_en = body.title_en || title;
        body.title_th = body.title_th || title;
        body.desc_en = body.desc_en || desc;
        body.desc_th = body.desc_th || desc;
        body.price = parseFloat(String(body.price).replace(/[^0-9.]/g, '')) || 0;
        body.category = body.category || 'components';
        body.icon = body.icon || 'images/001-asus-vivobook-15-x1504va.jpg';

        const newProduct = new Product(body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add product', details: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const body = { ...req.body };
        if (body.price !== undefined) {
            body.price = parseFloat(String(body.price).replace(/[^0-9.]/g, '')) || 0;
        }
        // Keep bilingual titles in sync if only one title or generic title is sent
        if (body.title && !body.title_en && !body.title_th) {
            body.title_en = body.title;
            body.title_th = body.title;
        }
        const updated = await Product.findOneAndUpdate(
            { id: req.params.id },
            { $set: body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Product not found' });
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

// --- ORDERS API ---
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
        const orderData = { ...req.body };
        if (!orderData.id) {
            orderData.id = 'ORD' + Math.floor(100000 + Math.random() * 900000);
        }
        if (orderData.username) {
            orderData.username = String(orderData.username).trim();
        }

        const newOrder = new Order(orderData);
        await newOrder.save();

        // Automatically clear user's cart in DB upon order creation
        if (orderData.username) {
            await User.updateMany(findUserQuery(orderData.username), { $set: { cart: [] } });
        }

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
});

app.patch('/api/orders/:id/confirm', async (req, res) => {
    try {
        const status = req.body?.status || 'Confirmed';
        const updated = await Order.findOneAndUpdate(
            { id: req.params.id },
            { $set: { status } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// --- ORDER HISTORY BY USER (Case-Insensitive) ---
app.get('/api/orders/user/:username', async (req, res) => {
    try {
        const exactRegex = new RegExp(`^${escapeRegex(req.params.username)}$`, 'i');
        const orders = await Order.find({ username: exactRegex }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

// --- USER AUTH & PROFILE API ---
app.post('/api/register', async (req, res) => {
    try {
        const rawUsername = String(req.body.username || '').trim();
        const password = String(req.body.password || '');
        const name = String(req.body.name || '').trim();

        if (!rawUsername || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne(findUserQuery(rawUsername));
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const normalizedUsername = rawUsername.toLowerCase();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: normalizedUsername,
            name: name || rawUsername.split('@')[0],
            email: normalizedUsername,
            password: hashedPassword,
            cart: []
        });

        await newUser.save();
        res.json({
            message: 'User registered successfully',
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
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
        const rawUsername = String(req.body.username || '').trim();
        const password = String(req.body.password || '');

        const user = await User.findOne(findUserQuery(rawUsername));
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

app.get('/api/user/:username', async (req, res) => {
    try {
        const user = await User.findOne(findUserQuery(req.params.username));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            username: user.username,
            name: user.name || user.username,
            email: user.email || user.username,
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || null,
            cart: user.cart || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

app.put('/api/user/:username', async (req, res) => {
    try {
        const { name, email, phone, address, avatar, password } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updated = await User.findOneAndUpdate(
            findUserQuery(req.params.username),
            { $set: updateData },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }
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

// --- CART API (Case-Insensitive) ---
app.get('/api/cart/:username', async (req, res) => {
    try {
        const user = await User.findOne(findUserQuery(req.params.username));
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.cart || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

app.post('/api/cart/:username', async (req, res) => {
    try {
        const { cart } = req.body;
        const user = await User.findOne(findUserQuery(req.params.username));
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.cart = Array.isArray(cart) ? cart : [];
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