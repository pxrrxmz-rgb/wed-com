
    bindCheckout();
function bindCheckout() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!checkoutBtn) {
            setTimeout(bindCheckout, 100);
            return;
        }

        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                if (typeof showToast === 'function') showToast('Your cart is empty!', true);
                else alert('Your cart is empty!');
                return;
            }

            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                if (typeof showToast === 'function') showToast('Please login to checkout', true);
                else alert('Please login to checkout');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }

            const cartSidebar = document.getElementById('cartSidebar');
            const cartOverlay = document.getElementById('cartOverlay');
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('active');

            renderCheckoutModal(cart);
        });
    }
    
    bindCheckout();

    function renderCheckoutModal(cart) {
        let existing = document.getElementById('checkoutModalOverlay');
        if (existing) existing.remove();

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        const overlay = document.createElement('div');
        overlay.id = 'checkoutModalOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.8)';
        overlay.style.backdropFilter = 'blur(15px)';
        overlay.style.zIndex = '100000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontFamily = "'Mitr', sans-serif";

        
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const textSecureCheckout = lang === 'th' ? 'การชำระเงินที่ปลอดภัย' : 'Secure Checkout';
    const textOrderSummary = lang === 'th' ? 'สรุปคำสั่งซื้อ' : 'Order Summary';
    const textTotal = lang === 'th' ? 'ยอดรวมทั้งหมด' : 'Total';
    const textShipping = lang === 'th' ? 'ที่อยู่สำหรับจัดส่ง' : 'Shipping Address';
    const textAddressPh = lang === 'th' ? '123 ถนน, เมือง, รหัสไปรษณีย์' : '123 Street, City, Zip Code';
    const textPayment = lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method';
    const textCard = lang === 'th' ? 'บัตรเครดิต/เดบิต' : 'Credit/Debit Card';
    const textPromptpay = lang === 'th' ? 'พร้อมเพย์ (QR Code)' : 'PromptPay (QR Code)';
    const textConfirmPay = lang === 'th' ? 'ยืนยันการชำระเงิน' : 'Confirm Payment';
    
    const modalHtml = `<div style="background:#1a1c23; border-radius:20px; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; position:relative; animation: slideUp 0.4s ease;">
        <button id="closeCheckout" style="position:absolute; top:20px; right:25px; background:transparent; border:none; color:#a4b0be; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
        
        <div style="padding:30px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <h2 style="color:white; margin:0;"><i class="fas fa-lock" style="color:#00C300; margin-right:10px;"></i> ${textSecureCheckout}</h2>
        </div>

        <div style="display:flex; flex-wrap:wrap; padding:30px; gap:30px;">
            <div style="flex:1; min-width:300px;">
                <h3 style="color:white; margin-bottom:15px;">${textOrderSummary}</h3>
                <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; color:white; font-size:1.2rem; font-weight:bold; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                        <span>${textTotal}</span>
                        <span style="color:#c02020;">฿${total.toFixed(2)}</span>
                    </div>
                </div>

                <h3 style="color:white; margin-bottom:15px;">${textShipping}</h3>
                <textarea id="chkAddress" placeholder="${textAddressPh}" style="width:100%; padding:15px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; font-family:inherit; margin-bottom:20px; min-height:100px; resize:vertical;"></textarea>
            </div>

            <div style="flex:1; min-width:300px;">
                <h3 style="color:white; margin-bottom:15px;">${textPayment}</h3>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <select id="chkMethod" style="width:100%; padding:15px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; font-family:inherit; cursor:pointer;">
                        <option value="card" style="background:#1a1c23;">${textCard}</option>
                        <option value="promptpay" style="background:#1a1c23;">${textPromptpay}</option>
                    </select>

                    <div id="cardDetails" style="background:rgba(255,255,255,0.02); padding:20px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                        <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" style="width:100%; padding:12px; margin-bottom:15px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;">
                        <div style="display:flex; gap:15px;">
                            <input type="text" placeholder="MM/YY" style="width:50%; padding:12px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;">
                            <input type="text" placeholder="CVC" style="width:50%; padding:12px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;">
                        </div>
                    </div>

                    <div id="promptpayDetails" style="display:none; background:rgba(255,255,255,0.02); padding:20px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); text-align:center;">
                        <p style="color:#a4b0be; margin-bottom:15px;">Scan QR Code to Pay</p>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" style="width:150px; height:150px; background:white; padding:10px; border-radius:8px;">
                    </div>

                    <button id="btnConfirmPay" style="width:100%; padding:15px; background:#c02020; color:white; border:none; border-radius:8px; font-size:1.1rem; font-weight:bold; cursor:pointer; margin-top:10px; transition:0.3s;">
                        ${textConfirmPay} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
        
        overlay.innerHTML = modalHtml;
        document.body.appendChild(overlay);

        document.getElementById('closeCheckout').addEventListener('click', () => overlay.remove());
        
        const chkMethod = document.getElementById('chkMethod');
        const cardDetails = document.getElementById('cardDetails');
        const promptpayDetails = document.getElementById('promptpayDetails');
        
        chkMethod.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardDetails.style.display = 'block';
                promptpayDetails.style.display = 'none';
            } else if (e.target.value === 'promptpay') {
                cardDetails.style.display = 'none';
                promptpayDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
                promptpayDetails.style.display = 'none';
            }
        });

        const btnConfirmPay = document.getElementById('btnConfirmPay');
        // Custom Alert Function for Checkout
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

            const cancelBtnHtml = showCancel ? `<button id="alertCancelBtn" style="padding:10px 30px; background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; border-radius:8px; font-size:1rem; cursor:pointer; margin-right:15px; font-family:'Mitr', sans-serif;">Cancel</button>` : '';

            alertOverlay.innerHTML = `
                <div style="background:#111; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:40px; text-align:center; color:white; min-width:320px; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.5); animation: popIn 0.3s ease;">
                    ${iconHtml}
                    <h2 style="margin-bottom:10px; color:${color};">${title}</h2>
                    <p style="color:#a4b0be; margin-bottom:30px; line-height:1.5;">${text}</p>
                    <div style="display:flex; justify-content:center;">
                        ${cancelBtnHtml}
                        <button id="alertConfirmBtn" style="padding:10px 30px; background:${color}; color:${type==='confirm'?'#000':'#fff'}; border:none; border-radius:8px; font-size:1rem; font-weight:bold; cursor:pointer; font-family:'Mitr', sans-serif;">
                            ${type === 'confirm' ? 'Yes, Confirm' : 'OK'}
                        </button>
                    </div>
                </div>
            `;

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
                showCustomAlert('error', lang === 'th' ? 'กรุณาระบุที่อยู่' : 'Address Required', lang === 'th' ? 'กรุณาระบุที่อยู่จัดส่งก่อนยืนยันคำสั่งซื้อ' : 'Please provide your shipping address before placing the order.', null, false);
                return;
            }
            
            showCustomAlert('confirm', lang === 'th' ? 'ยืนยันคำสั่งซื้อ' : 'Confirm Order', lang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อ? กรุณาตรวจสอบรายละเอียดก่อนยืนยัน' : 'Are you sure you want to place this order? Check your details carefully before confirming.', () => {
                btnConfirmPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                btnConfirmPay.disabled = true;
                btnConfirmPay.style.opacity = '0.7';

                setTimeout(() => {
                    overlay.style.display = 'none'; 
                    
                    showCustomAlert('success', lang === 'th' ? 'ชำระเงินสำเร็จ!' : 'Payment Successful!', lang === 'th' ? 'คำสั่งซื้อของคุณสำเร็จแล้ว กำลังกลับสู่หน้าหลัก...' : 'Your order has been placed successfully. Redirecting to home...', () => {
                        window.location.href = 'index.html';
                    }, false);
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);

                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    const username = currentUser ? (currentUser.username || currentUser.email || 'Guest') : 'Guest';

                    // Save order to MongoDB
                    const orderPayload = {
                        id: 'ORD' + Math.floor(Math.random()*1000000),
                        date: new Date().toISOString(),
                        total: total,
                        items: cart,
                        status: 'Processing',
                        address: addr,
                        payment: chkMethod.value,
                        username: username
                    };

                    fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderPayload)
                    }).catch(err => console.error('Failed to sync order', err));

                    // Clear cart
                    localStorage.setItem('cart', '[]');
                    if (currentUser && currentUser.username) {
                        fetch('/api/cart/' + currentUser.username, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cart: [] })
                        }).catch(e => console.error('Failed to clear cart on backend', e));
                    }
                    const cartBadge = document.getElementById('cartBadge');
                    if (cartBadge) { cartBadge.textContent = '0'; cartBadge.style.display = 'none'; }



                }, 1500);
            }, true);
        });
    }

