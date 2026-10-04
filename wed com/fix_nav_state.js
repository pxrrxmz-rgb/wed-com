const fs = require('fs');
let content = fs.readFileSync('navbar.js', 'utf8');

if (!content.includes('Top Navigation Active State')) {
    content += `\n
// --- Top Navigation Active State (Moved from shop.js to be shared globally) ---
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#mainNav a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
`;
    fs.writeFileSync('navbar.js', content, 'utf8');
    console.log('Added active state logic to navbar.js');
}

let shopContent = fs.readFileSync('shop.js', 'utf8');
const shopRegex = /\/\/ --- 1\. Top Navigation Active State ---[\s\S]*?\n    \}\);/m;
if (shopRegex.test(shopContent)) {
    shopContent = shopContent.replace(shopRegex, '// --- 1. Top Navigation Active State --- (Moved to navbar.js)');
    fs.writeFileSync('shop.js', shopContent, 'utf8');
    console.log('Removed duplicate active state from shop.js');
}
