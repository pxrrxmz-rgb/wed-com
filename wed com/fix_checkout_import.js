const fs = require('fs');

let c = fs.readFileSync('navbar.js', 'utf-8');
if (!c.includes('checkout.js')) {
    c += '\ndocument.write(\'<script src="checkout.js"><\\/script>\');';
    fs.writeFileSync('navbar.js', c);
}
