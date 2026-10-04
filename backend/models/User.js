const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [{
        id: String,
        title: String,
        price: Number,
        img: String,
        qty: Number
    }]
});

module.exports = mongoose.model('User', userSchema);
