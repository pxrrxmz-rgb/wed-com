const fs = require('fs');
const content = fs.readFileSync('shop.js', 'utf-8');

const target = "let cart = JSON.parse(localStorage.getItem('cart')) || [];";
const replacement = `let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Auto-fix any corrupted cart data from previous bug
    let cartFixed = false;
    cart.forEach(item => {
        if (item.quantity !== undefined) {
            item.qty = item.qty || item.quantity;
            delete item.quantity;
            cartFixed = true;
        }
        if (item.name && !item.title) {
            item.title = item.name;
            delete item.name;
            cartFixed = true;
        }
    });
    if (cartFixed) localStorage.setItem('cart', JSON.stringify(cart));`;

if (content.includes(target)) {
    fs.writeFileSync('shop.js', content.replace(target, replacement), 'utf-8');
    console.log('shop.js patched with cart data fixer.');
} else {
    console.log('Target string not found in shop.js');
}
