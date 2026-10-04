const fs = require('fs');

let shopContent = fs.readFileSync('shop.js', 'utf8');

// Update renderCart to be global and refresh cart from localStorage
const oldRenderCart = `    function renderCart() {
        cartItemsContainer.innerHTML = '';`;

const newRenderCart = `    window.renderCart = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';`;
        
shopContent = shopContent.replace(oldRenderCart, newRenderCart);

// Make sure internal calls to renderCart use window.renderCart (or keep it working via scoping if possible, but window.renderCart ensures it)
shopContent = shopContent.replace(/renderCart\(\);/g, 'window.renderCart();');

// Also updateBadge needs to refresh the cart
const oldUpdateBadge = `    function updateBadge() {
        if (cartBadge) {
            cartBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
        }
    }`;

const newUpdateBadge = `    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartBadge) {
            cartBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
        }
    }`;

if (shopContent.includes(oldUpdateBadge)) {
    shopContent = shopContent.replace(oldUpdateBadge, newUpdateBadge);
    shopContent = shopContent.replace(/updateBadge\(\);/g, 'window.updateBadge();');
}

fs.writeFileSync('shop.js', shopContent, 'utf8');
console.log('Fixed renderCart and updateBadge in shop.js');
