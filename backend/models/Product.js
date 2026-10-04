const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title_en: String,
    title_th: String,
    desc_en: String,
    desc_th: String,
    price: Number,
    category: String,
    icon: String
});

module.exports = mongoose.model('Product', productSchema);
