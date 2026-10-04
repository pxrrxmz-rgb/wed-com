const fs = require('fs');

let navbarContent = fs.readFileSync('navbar.js', 'utf8');

navbarContent = navbarContent.replace(
    '<span class="cart-badge" id="cartBadge">0</span>',
    '<span class="cart-badge" id="cartBadge" style="display: none;">0</span>'
);

fs.writeFileSync('navbar.js', navbarContent, 'utf8');
console.log('Fixed navbar.js initial badge display');
