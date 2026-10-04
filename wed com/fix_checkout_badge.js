const fs = require('fs');

let content = fs.readFileSync('checkout.js', 'utf8');

content = content.replace(
    "if (cartBadge) cartBadge.textContent = '0';",
    "if (cartBadge) { cartBadge.textContent = '0'; cartBadge.style.display = 'none'; }"
);

fs.writeFileSync('checkout.js', content, 'utf8');
console.log('Fixed checkout.js badge reset visibility');
