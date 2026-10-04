const fs = require('fs');
let productsJs = fs.readFileSync('products.js', 'utf8');

productsJs = productsJs.replace(/typeof renderCart === 'function'\) renderCart\(\);/g, "typeof window.renderCart === 'function') window.renderCart();");
fs.writeFileSync('products.js', productsJs, 'utf8');
console.log('Fixed renderCart call in products.js');
