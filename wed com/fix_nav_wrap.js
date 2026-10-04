const fs = require('fs');

let css = fs.readFileSync('home.css', 'utf8');

css = css.replace(
    '.nav-links a {\n    color: #8c92a0;\n    text-decoration: none;\n    font-weight: 500;\n    font-size: 0.95rem;\n    transition: 0.3s;\n}',
    '.nav-links a {\n    color: #8c92a0;\n    text-decoration: none;\n    font-weight: 500;\n    font-size: 0.95rem;\n    transition: 0.3s;\n    white-space: nowrap;\n}'
);

fs.writeFileSync('home.css', css, 'utf8');
console.log('Added white-space: nowrap to nav-links');
