const fs = require('fs');
let content = fs.readFileSync('home.css', 'utf8');

// Update .logo
content = content.replace('.logo {\n    font-size: 1.6rem;', '.logo {\n    flex: 1;\n    display: flex;\n    justify-content: flex-start;\n    font-size: 1.6rem;');

// Update .nav-actions
content = content.replace('.nav-actions {\n    display: flex;\n    align-items: center;', '.nav-actions {\n    flex: 1;\n    display: flex;\n    justify-content: flex-end;\n    align-items: center;');

// Update .nav-pill
content = content.replace('.nav-pill {\n    background: rgba(255,255,255,0.05);', '.nav-pill {\n    flex: 0 1 auto;\n    background: rgba(255,255,255,0.05);');

fs.writeFileSync('home.css', content, 'utf8');
console.log('Fixed home.css layout shifts');
