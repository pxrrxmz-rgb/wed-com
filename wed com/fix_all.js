const fs = require('fs');

// 1. Fix CSS Files (Fonts + Button bug)
const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));
const mitrImport = "@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;600&display=swap');\n";

for (const file of cssFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    
    if (!content.includes('family=Mitr')) {
        content = mitrImport + content;
    }
    
    content = content.replace(/font-family:[^;]+;/g, "font-family: 'Mitr', sans-serif;");
    
    if (file === 'login.css') {
        // Fix global button styling that ruins cart buttons
        content = content.replace(/\nbutton \{/g, "\n.form-container button {");
        content = content.replace(/\nbutton:hover \{/g, "\n.form-container button:hover {");
    }
    
    fs.writeFileSync(file, content, 'utf-8');
}

// 2. Fix JS Files (Inline fonts + Price display)
const jsFiles = ['products.js', 'navbar.js', 'admin.js', 'shop.js', 'auth.js'];
for (const file of jsFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf-8');
    
    content = content.replace(/font-family:[^;]+;/g, "font-family: 'Mitr', sans-serif;");
    
    fs.writeFileSync(file, content, 'utf-8');
}

// 3. Fix HTML Files (Inline fonts)
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/font-family:[^;"]+;/g, "font-family: 'Mitr', sans-serif;");
    fs.writeFileSync(file, content, 'utf-8');
}

// 4. Update products.js logic to show correct discount price instead of THB calculation
let prodJs = fs.readFileSync('products.js', 'utf-8');

// The THB line is: const wPriceThb = (p.price * 35).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
// The THB output is: <div class="w-price">THB ${wPriceThb}</div>

const priceLogicOld = "const wPriceThb = (p.price * 35).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});";
const priceLogicNew = `let priceDisplay = \`$\${p.price.toFixed(2)}\`;
    if (p.category === 'deals') {
        const oldPrice = (p.price * 1.3).toFixed(2);
        const discountPct = Math.round((1 - (p.price / oldPrice)) * 100);
        priceDisplay = \`
            <div style="font-size:1.2rem; color:#8c92a0; text-decoration:line-through; margin-bottom:5px;">$\${oldPrice}</div>
            <div style="display:flex; align-items:center; gap:15px;">
                $\${p.price.toFixed(2)}
                <span style="background: rgba(192, 32, 32, 0.2); color: #c02020; padding: 4px 10px; border-radius: 4px; font-size: 1rem; font-weight: bold;">\${discountPct}% OFF</span>
            </div>
        \`;
    }`;

prodJs = prodJs.replace(priceLogicOld, priceLogicNew);
prodJs = prodJs.replace('<div class="w-price">THB ${wPriceThb}</div>', '<div class="w-price">${priceDisplay}</div>');

fs.writeFileSync('products.js', prodJs, 'utf-8');

// Ensure Cart UI in navbar.js and shop.js looks nice too by tweaking styles if necessary, but fixing the global button bug usually resolves it.
// Let's add some quick style to cart-header button and cart-item-remove in home.css to ensure they are constrained
let homeCss = fs.readFileSync('home.css', 'utf-8');
if (!homeCss.includes('.cart-item-remove { width: auto;')) {
    homeCss = homeCss.replace('.cart-item-remove {', '.cart-item-remove { width: auto; padding: 5px; ');
    homeCss = homeCss.replace('.cart-header button {', '.cart-header button { width: auto; padding: 5px; ');
    fs.writeFileSync('home.css', homeCss, 'utf-8');
}

console.log('All styling, fonts, and prices fixed.');
