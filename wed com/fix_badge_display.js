const fs = require('fs');

// Update shop.js
let shopContent = fs.readFileSync('shop.js', 'utf8');
const oldBadge = `    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (typeof cartBadge !== 'undefined' && cartBadge) cartBadge.textContent = count;
    }`;
const newBadge = `    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (typeof cartBadge !== 'undefined' && cartBadge) {
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }`;
shopContent = shopContent.replace(oldBadge, newBadge);
fs.writeFileSync('shop.js', shopContent, 'utf8');

// Update products.js
let productsContent = fs.readFileSync('products.js', 'utf8');

const productsOld1 = `                const badge = document.getElementById('cartBadge');
                if (badge) badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);`;
const productsNew1 = `                if (typeof window.updateBadge === 'function') {
                    window.updateBadge();
                } else {
                    const badge = document.getElementById('cartBadge');
                    const count = cart.reduce((sum, i) => sum + i.qty, 0);
                    if (badge) {
                        badge.textContent = count;
                        badge.style.display = count > 0 ? 'inline-block' : 'none';
                    }
                }`;
productsContent = productsContent.replace(productsOld1, productsNew1);

const productsOld2 = `            // Update UI manually
            const badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
            }`;
const productsNew2 = `            // Update UI manually
            if (typeof window.updateBadge === 'function') {
                window.updateBadge();
            } else {
                const badge = document.getElementById('cartBadge');
                const count = cart.reduce((sum, i) => sum + i.qty, 0);
                if (badge) {
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            }`;
productsContent = productsContent.replace(productsOld2, productsNew2);

fs.writeFileSync('products.js', productsContent, 'utf8');

console.log('Fixed cart badge visibility logic in shop.js and products.js');
