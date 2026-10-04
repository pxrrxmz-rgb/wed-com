const fs = require('fs');

// 1. Fix Bug 1: Login state on product.html
let productHtml = fs.readFileSync('product.html', 'utf-8');
productHtml = productHtml.replace('<script src="login.js"></script>', '<script src="auth.js"></script>');
fs.writeFileSync('product.html', productHtml, 'utf-8');
console.log('Fixed auth.js in product.html');

// 2. Fix Bug 2: Login page layout proportions
let loginCss = fs.readFileSync('login.css', 'utf-8');
// Original: width: 400px; height: 520px;
loginCss = loginCss.replace('width: 400px;', 'width: 420px;');
loginCss = loginCss.replace('height: 520px;', 'height: 620px;');

// Also add a little margin to the top of the form elements so they space out better in the 620px height
if (!loginCss.includes('.form-container form { padding: 0 40px; }')) {
    loginCss = loginCss.replace('.form-container form {', '.form-container form {\n    padding: 0 40px;\n    height: 100%;\n    justify-content: center;');
}
fs.writeFileSync('login.css', loginCss, 'utf-8');
console.log('Fixed login.css proportions');

// 3. Fix Bug 3: Discount price styling (old-price)
let homeCss = fs.readFileSync('home.css', 'utf-8');
if (!homeCss.includes('.old-price')) {
    homeCss += `\n/* Discount Price */\n.old-price {\n    text-decoration: line-through;\n    color: #8c92a0;\n    font-size: 0.8em;\n    margin-right: 8px;\n    font-weight: 400;\n}\n`;
    fs.writeFileSync('home.css', homeCss, 'utf-8');
    console.log('Added .old-price style to home.css');
}
