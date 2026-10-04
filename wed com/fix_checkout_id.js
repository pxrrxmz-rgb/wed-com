const fs = require('fs');

let c = fs.readFileSync('navbar.js', 'utf-8');
c = c.replace('class="btn-primary-pill" style="width: 100%; justify-content: center; margin-top: 15px;" data-i18n="cart_checkout"', 'id="checkoutBtn" class="btn-primary-pill" style="width: 100%; justify-content: center; margin-top: 15px;" data-i18n="cart_checkout"');
fs.writeFileSync('navbar.js', c);
