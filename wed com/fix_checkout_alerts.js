const fs = require('fs');

let c = fs.readFileSync('checkout.js', 'utf-8');

const targetStr = `        btnConfirmPay.addEventListener('click', () => {`;

const startIdx = c.indexOf(targetStr);
if (startIdx === -1) {
    console.log("Could not find btnConfirmPay");
    process.exit(1);
}

const endIdx = c.indexOf('        });\n    }\n});', startIdx);

const replacement = `        // Custom Alert Function for Checkout
        function showCustomAlert(type, title, text, onConfirm, showCancel = false) {
            const alertOverlay = document.createElement('div');
            alertOverlay.style.position = 'fixed';
            alertOverlay.style.top = '0'; alertOverlay.style.left = '0';
            alertOverlay.style.width = '100vw'; alertOverlay.style.height = '100vh';
            alertOverlay.style.background = 'rgba(0,0,0,0.85)';
            alertOverlay.style.backdropFilter = 'blur(10px)';
            alertOverlay.style.zIndex = '100005';
            alertOverlay.style.display = 'flex';
            alertOverlay.style.justifyContent = 'center';
            alertOverlay.style.alignItems = 'center';
            alertOverlay.style.fontFamily = "'Mitr', sans-serif";

            let iconHtml = '';
            let color = '';
            if (type === 'error') {
                iconHtml = '<i class="fas fa-times-circle" style="font-size:5rem; color:#e74c3c; margin-bottom:20px;"></i>';
                color = '#e74c3c';
            } else if (type === 'success') {
                iconHtml = '<i class="fas fa-check-circle" style="font-size:5rem; color:#2ecc71; margin-bottom:20px;"></i>';
                color = '#2ecc71';
            } else if (type === 'confirm') {
                iconHtml = '<i class="fas fa-question-circle" style="font-size:5rem; color:#f1c40f; margin-bottom:20px;"></i>';
                color = '#f1c40f';
            }

            const cancelBtnHtml = showCancel ? \`<button id="alertCancelBtn" style="padding:10px 30px; background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; border-radius:8px; font-size:1rem; cursor:pointer; margin-right:15px; font-family:'Mitr', sans-serif;">Cancel</button>\` : '';

            alertOverlay.innerHTML = \`
                <div style="background:#111; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:40px; text-align:center; color:white; min-width:320px; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.5); animation: popIn 0.3s ease;">
                    \${iconHtml}
                    <h2 style="margin-bottom:10px; color:\${color};">\${title}</h2>
                    <p style="color:#a4b0be; margin-bottom:30px; line-height:1.5;">\${text}</p>
                    <div style="display:flex; justify-content:center;">
                        \${cancelBtnHtml}
                        <button id="alertConfirmBtn" style="padding:10px 30px; background:\${color}; color:\${type==='confirm'?'#000':'#fff'}; border:none; border-radius:8px; font-size:1rem; font-weight:bold; cursor:pointer; font-family:'Mitr', sans-serif;">
                            \${type === 'confirm' ? 'Yes, Confirm' : 'OK'}
                        </button>
                    </div>
                </div>
            \`;

            document.body.appendChild(alertOverlay);

            document.getElementById('alertConfirmBtn').addEventListener('click', () => {
                alertOverlay.remove();
                if (onConfirm) onConfirm();
            });

            if (showCancel) {
                document.getElementById('alertCancelBtn').addEventListener('click', () => {
                    alertOverlay.remove();
                });
            }
        }

        btnConfirmPay.addEventListener('click', () => {
            const addr = document.getElementById('chkAddress').value.trim();
            if (!addr) {
                showCustomAlert('error', 'Address Required', 'Please provide your shipping address before placing the order.', null, false);
                return;
            }
            
            showCustomAlert('confirm', 'Confirm Order', 'Are you sure you want to place this order? Check your details carefully before confirming.', () => {
                btnConfirmPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                btnConfirmPay.disabled = true;
                btnConfirmPay.style.opacity = '0.7';

                setTimeout(() => {
                    overlay.style.display = 'none'; 
                    
                    showCustomAlert('success', 'Payment Successful!', 'Your order has been placed successfully. Redirecting to home...', () => {
                        window.location.href = 'index.html';
                    }, false);
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);

                    localStorage.setItem('cart', '[]');
                    const cartBadge = document.getElementById('cartBadge');
                    if (cartBadge) cartBadge.textContent = '0';
                    
                    const orders = JSON.parse(localStorage.getItem('orders')) || [];
                    orders.push({
                        id: 'ORD' + Math.floor(Math.random()*1000000),
                        date: new Date().toISOString(),
                        total: total,
                        items: cart,
                        status: 'Processing',
                        address: addr,
                        payment: chkMethod.value
                    });
                    localStorage.setItem('orders', JSON.stringify(orders));

                }, 1500);
            }, true);
`;

const newC = c.substring(0, startIdx) + replacement + c.substring(endIdx);
fs.writeFileSync('checkout.js', newC, 'utf-8');
console.log('checkout updated');
