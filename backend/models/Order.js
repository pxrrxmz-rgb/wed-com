const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    total: Number,
    items: Array,
    status: { type: String, default: 'Processing' },
    address: String,
    payment: String,
    username: String
});

module.exports = mongoose.model('Order', orderSchema);
