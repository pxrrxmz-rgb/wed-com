const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const navStart = indexHtml.indexOf('<nav class="navbar">');
const navEnd = indexHtml.indexOf('</nav>') + 6;
const navbar = indexHtml.substring(navStart, navEnd);

const footerStart = indexHtml.indexOf('<footer');
const footerEnd = indexHtml.indexOf('</footer>') + 9;
const footer = indexHtml.substring(footerStart, footerEnd);

let productHtml = fs.readFileSync('product.html', 'utf8');
productHtml = productHtml.replace('${navbar}', navbar);
productHtml = productHtml.replace('${footer}', footer);
fs.writeFileSync('product.html', productHtml, 'utf8');
console.log('Fixed product.html');
