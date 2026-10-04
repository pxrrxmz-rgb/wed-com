const fs = require('fs');

let content = fs.readFileSync('checkout.js', 'utf8');

const buggyRegex = /const orders = JSON\.parse\(localStorage\.getItem\('orders'\)\) \|\| \[\];[\s\S]*?localStorage\.setItem\('orders', JSON\.stringify\(orders\)\);/;

const fixedCode = `const orders = JSON.parse(localStorage.getItem('orders')) || [];
                    orders.push({
                        id: 'ORD' + Math.floor(Math.random()*1000000),
                        date: new Date().toISOString(),
                        total: total,
                        items: cart,
                        status: 'Processing',
                        address: addr,
                        payment: chkMethod.value
                    });
                    localStorage.setItem('orders', JSON.stringify(orders));`;

content = content.replace(buggyRegex, fixedCode);
fs.writeFileSync('checkout.js', content, 'utf8');
console.log('Fixed checkout.js SyntaxError');
