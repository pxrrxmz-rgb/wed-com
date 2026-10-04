const fs = require('fs');
let content = fs.readFileSync('shop.js', 'utf8');
content = content.replace(/updateBadge\(\);/g, 'window.updateBadge();');
fs.writeFileSync('shop.js', content, 'utf8');
console.log('Fixed updateBadge calls');
