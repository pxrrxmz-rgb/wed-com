const fs = require('fs');

// Fix product.html
let productHtml = fs.readFileSync('product.html', 'utf8');
productHtml = productHtml.replace('<link rel="stylesheet" href="login.css">', '');
fs.writeFileSync('product.html', productHtml, 'utf8');

// Fix home.css .btn-login
let homeCss = fs.readFileSync('home.css', 'utf8');
homeCss = homeCss.replace(
    '.btn-login {\n    background: #c02020;\n    color: #ffffff;\n    text-decoration: none;\n    padding: 10px 24px;\n    border-radius: 30px; /* Pill shape */\n    font-weight: 600;\n    font-size: 0.95rem;\n    transition: 0.3s;\n    display: flex;\n    align-items: center;',
    '.btn-login {\n    background: #c02020;\n    color: #ffffff;\n    text-decoration: none;\n    padding: 10px 24px;\n    border-radius: 30px; /* Pill shape */\n    font-weight: 600;\n    font-size: 0.95rem;\n    transition: 0.3s;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    white-space: nowrap;'
);
fs.writeFileSync('home.css', homeCss, 'utf8');
console.log('Fixed navbar width and logout text wrapping');
