const fs = require('fs');
const content = fs.readFileSync('products.js', 'utf-8');

const targetStr = `const addBtn = container.querySelector('.add-to-cart-detail');`;
const endStr = `window.openProductDetail = openProductDetail;`;

const startIdx = content.indexOf(targetStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.log("Could not find bounds");
    process.exit(1);
}

const newListener = `const addBtn = container.querySelector('.add-to-cart-detail');
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const item = {
                id: e.currentTarget.getAttribute('data-id'),
                title: e.currentTarget.getAttribute('data-name'),
                price: parseFloat(e.currentTarget.getAttribute('data-price')),
                qty: 1
            };
            const existing = cart.find(x => x.id === item.id);
            if(existing) {
                existing.qty++;
            } else {
                cart.push(item);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update UI manually
            const badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
            }
            
            if (typeof showToast === 'function') {
                showToast(\`Added \${item.title} to cart!\`);
            } else {
                const toast = document.getElementById('toastNotification');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
            }
        });
    }
}
`;

const newContent = content.substring(0, startIdx) + newListener + content.substring(endIdx);

fs.writeFileSync('products.js', newContent, 'utf-8');
console.log('Fixed add to cart');
