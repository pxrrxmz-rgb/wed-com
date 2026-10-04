const fs = require('fs');
let content = fs.readFileSync('products.js', 'utf8');

const target = `        grid.appendChild(card);
    });

    if (typeof bindAddToCart === 'function') {
        bindAddToCart();
    }
}`;

const replacement = `        const btnAdd = card.querySelector('.btn-add');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.stopPropagation();
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = {
                    id: p.id,
                    title: title,
                    price: parseFloat(p.price),
                    qty: 1
                };
                const existing = cart.find(x => x.id === item.id);
                if (existing) {
                    existing.qty++;
                } else {
                    cart.push(item);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                
                const badge = document.getElementById('cartBadge');
                if (badge) badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
                
                if (typeof renderCart === 'function') renderCart();
                
                if (typeof showToast === 'function') {
                    showToast(lang === 'th' ? \`เพิ่ม \${title} ลงตะกร้าแล้ว!\` : \`Added \${title} to cart!\`);
                } else {
                    alert(lang === 'th' ? \`เพิ่ม \${title} ลงตะกร้าแล้ว!\` : \`Added \${title} to cart!\`);
                }
            });
        }
        grid.appendChild(card);
    });
}`;

content = content.replace(target, replacement);
fs.writeFileSync('products.js', content, 'utf8');
console.log('Fixed products.js Add to Cart buttons');
