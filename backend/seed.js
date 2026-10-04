require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB for seeding');

    // Load JSON
    const jsonPath = 'C:/Users/User/Downloads/computer-store-catalog (2)/computer-store-catalog/products.json';
    const catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const newProducts = catalog.map((p, index) => {
        let cat = 'deals';
        if (p.category === 'Notebook') cat = 'laptops';
        else if (['CPU', 'Mainboard', 'Graphic Card', 'RAM', 'SSD / Storage', 'Power Supply / Computer Case'].includes(p.category)) cat = 'components';
        else if (p.category === 'คอมประกอบ') cat = 'prebuilds';
        
        let numPrice = parseFloat(p.price.replace(/[^0-9.]/g, ''));
        if (isNaN(numPrice)) numPrice = 999.99;
        
        const filename = p.image ? p.image.split('/').pop() : 'default.png';
        
        return {
            id: (index + 1).toString(),
            title_en: p.name,
            title_th: p.name,
            desc_en: p.description,
            desc_th: p.description,
            price: numPrice,
            category: cat,
            icon: 'images/' + filename
        };
    });

    // Clear existing products
    await Product.deleteMany({});
    console.log('Old products cleared');

    // Insert new products
    await Product.insertMany(newProducts);
    console.log(`Successfully seeded \${newProducts.length} products to MongoDB!`);

    mongoose.connection.close();
}).catch(err => {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
});
