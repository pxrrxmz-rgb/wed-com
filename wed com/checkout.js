(function() {
    let isCheckoutBound = false;

    function bindCheckout() {
        if (isCheckoutBound) return;
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!checkoutBtn) {
            setTimeout(bindCheckout, 100);
            return;
        }
        isCheckoutBound = true;

        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                if (typeof showToast === 'function') showToast(lang === 'th' ? 'ตะกร้าสินค้าของคุณว่างเปล่า!' : 'Your cart is empty!', true);
                return;
            }

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                if (typeof showToast === 'function') showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนชำระเงิน' : 'Please login to checkout', true);
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                return;
            }

            const cartSidebar = document.getElementById('cartSidebar');
            const cartOverlay = document.getElementById('cartOverlay');
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('active');

            renderCheckoutModal(cart, currentUser);
        });
    }

    bindCheckout();

    function renderCheckoutModal(cart, currentUser) {
        let existing = document.getElementById('checkoutModalOverlay');
        if (existing) existing.remove();

        const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        const textSecureCheckout = lang === 'th' ? 'ยืนยันคำสั่งซื้อและชำระเงิน' : 'Secure Checkout';
        const textOrderSummary = lang === 'th' ? 'สรุปรายการสินค้า' : 'Order Summary';
        const textTotal = lang === 'th' ? 'ยอดชำระสุทธิ' : 'Total Amount';
        const textShipping = lang === 'th' ? 'ที่อยู่สำหรับจัดส่ง' : 'Shipping Address';
        const textAddressPh = lang === 'th' ? 'บ้านเลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์ และเบอร์โทรศัพท์' : 'House No., Street, District, Province, Zip Code & Phone';
        const textPayment = lang === 'th' ? 'เลือกช่องทางการชำระเงิน' : 'Payment Method';
        const textPromptpay = lang === 'th' ? 'สแกนจ่าย QR PromptPay (พร้อมเพย์)' : 'PromptPay (QR Code)';
        const textCod = lang === 'th' ? 'เก็บเงินปลายทาง (Cash on Delivery)' : 'Cash on Delivery (COD)';
        const textCard = lang === 'th' ? 'บัตรเครดิต / เดบิต (Credit/Debit Card)' : 'Credit / Debit Card';
        const textConfirmPay = lang === 'th' ? 'ยืนยันการสั่งซื้อ' : 'Place Order Now';

        const itemsListHtml = cart.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; color:#d1d8e0; margin-bottom:8px;">
                <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:10px;">${item.title} <strong style="color:#8c92a0;">x${item.qty}</strong></span>
                <span style="color:#fff; font-weight:500;">฿${((item.price || 0) * (item.qty || 1)).toLocaleString('en-US')}</span>
            </div>
        `).join('');

        const savedAddress = (currentUser && currentUser.address) ? currentUser.address : '';

        const overlay = document.createElement('div');
        overlay.id = 'checkoutModalOverlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.82); backdrop-filter:blur(12px); z-index:100000; display:flex; justify-content:center; align-items:center; font-family:"Mitr", sans-serif;';

        overlay.innerHTML = `
        <div style="background:#18191f; border:1px solid rgba(255,255,255,0.12); border-radius:20px; width:92%; max-width:820px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.7);">
            <button id="closeCheckout" style="position:absolute; top:20px; right:25px; background:rgba(255,255,255,0.06); width:36px; height:36px; border-radius:50%; border:none; color:#a4b0be; font-size:1.1rem; cursor:pointer;"><i class="fas fa-times"></i></button>
            
            <div style="padding:24px 30px; border-bottom:1px solid rgba(255,255,255,0.08);">
                <h2 style="color:white; margin:0; font-size:1.4rem;"><i class="fas fa-shield-check" style="color:#2ecc71; margin-right:10px;"></i> ${textSecureCheckout}</h2>
            </div>

            <div style="display:flex; flex-wrap:wrap; padding:28px 30px; gap:28px;">
                <div style="flex:1; min-width:280px;">
                    <h3 style="color:white; margin-bottom:12px; font-size:1.05rem;">${textOrderSummary} (${cart.reduce((s,i)=>s+(i.qty||1),0)})</h3>
                    <div style="background:rgba(0,0,0,0.28); padding:18px; border-radius:12px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="max-height:150px; overflow-y:auto; margin-bottom:12px; padding-right:4px;">
                            ${itemsListHtml}
                        </div>
                        <div style="display:flex; justify-content:space-between; color:white; font-size:1.2rem; font-weight:600; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);">
                            <span>${textTotal}</span>
                            <span style="color:#2ecc71;">฿${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <h3 style="color:white; margin-bottom:10px; font-size:1.05rem;">${textShipping}</h3>
                    <textarea id="chkAddress" placeholder="${textAddressPh}" style="width:100%; padding:14px; border-radius:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:white; font-family:inherit; min-height:105px; resize:vertical; outline:none;">${savedAddress}</textarea>
                </div>

                <div style="flex:1; min-width:280px;">
                    <h3 style="color:white; margin-bottom:12px; font-size:1.05rem;">${textPayment}</h3>
                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <select id="chkMethod" style="width:100%; padding:13px 15px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:white; font-family:inherit; cursor:pointer; outline:none;">
                            <option value="promptpay" style="background:#18191f;">${textPromptpay}</option>
                            <option value="cod" style="background:#18191f;">${textCod}</option>
                            <option value="card" style="background:#18191f;">${textCard}</option>
                        </select>

                        <div id="promptpayDetails" style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); text-align:center;">
                            <p style="color:#d1d8e0; margin-bottom:12px; font-size:0.92rem;">${lang === 'th' ? 'สแกน QR Code ด้วยแอปธนาคารเพื่อชำระเงิน' : 'Scan QR Code with your banking app'}</p>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" style="width:145px; height:145px; background:white; padding:10px; border-radius:10px;">
                            <p style="color:#2ecc71; margin-top:10px; font-weight:600;">฿${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>

                        <div id="codDetails" style="display:none; background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); text-align:center; color:#a4b0be;">
                            <i class="fas fa-truck-fast" style="font-size:2.4rem; color:#c02020; margin-bottom:10px;"></i>
                            <p style="font-size:0.92rem;">${lang === 'th' ? 'เตรียมรับสินค้าและชำระเงินสดกับเจ้าหน้าที่ขนส่งเมื่อสินค้าถึงหน้าบ้าน' : 'Pay in cash upon delivery at your doorstep.'}</p>
                        </div>

                        <div id="cardDetails" style="display:none; background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
                            <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" maxlength="19" style="width:100%; padding:12px; margin-bottom:12px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:white; font-family:inherit;">
                            <div style="display:flex; gap:12px;">
                                <input type="text" placeholder="MM/YY" maxlength="5" style="width:50%; padding:12px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:white; font-family:inherit;">
                                <input type="password" placeholder="CVC" maxlength="4" style="width:50%; padding:12px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:white; font-family:inherit;">
                            </div>
                        </div>

                        <button id="btnConfirmPay" style="width:100%; padding:15px; background:#c02020; color:white; border:none; border-radius:12px; font-size:1.05rem; font-weight:600; font-family:inherit; cursor:pointer; margin-top:6px; transition:0.3s;">
                            ${textConfirmPay} <i class="fas fa-check-circle" style="margin-left:6px;"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.appendChild(overlay);

        document.getElementById('closeCheckout').addEventListener('click', () => overlay.remove());

        const chkMethod = document.getElementById('chkMethod');
        const cardDetails = document.getElementById('cardDetails');
        const promptpayDetails = document.getElementById('promptpayDetails');
        const codDetails = document.getElementById('codDetails');

        chkMethod.addEventListener('change', (e) => {
            cardDetails.style.display = e.target.value === 'card' ? 'block' : 'none';
            promptpayDetails.style.display = e.target.value === 'promptpay' ? 'block' : 'none';
            codDetails.style.display = e.target.value === 'cod' ? 'block' : 'none';
        });

        const btnConfirmPay = document.getElementById('btnConfirmPay');

        function showCustomAlert(type, title, text, onConfirm, showCancel = false) {
            const alertOverlay = document.createElement('div');
            alertOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:100005; display:flex; justify-content:center; align-items:center; font-family:"Mitr", sans-serif;';

            let iconHtml = '';
            let color = '';
            if (type === 'error') {
                iconHtml = '<i class="fas fa-times-circle" style="font-size:4.2rem; color:#e74c3c; margin-bottom:15px;"></i>';
                color = '#e74c3c';
            } else if (type === 'success') {
                iconHtml = '<i class="fas fa-check-circle" style="font-size:4.2rem; color:#2ecc71; margin-bottom:15px;"></i>';
                color = '#2ecc71';
            } else {
                iconHtml = '<i class="fas fa-question-circle" style="font-size:4.2rem; color:#f1c40f; margin-bottom:15px;"></i>';
                color = '#f1c40f';
            }

            const cancelBtnHtml = showCancel ? `<button id="alertCancelBtn" style="padding:10px 24px; background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; border-radius:10px; font-size:0.95rem; cursor:pointer; margin-right:12px; font-family:'Mitr', sans-serif;">${lang === 'th' ? 'ยกเลิก' : 'Cancel'}</button>` : '';

            alertOverlay.innerHTML = `
                <div style="background:#18191f; border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:35px; text-align:center; color:white; width:90%; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.6);">
                    ${iconHtml}
                    <h2 style="margin-bottom:10px; color:${color}; font-size:1.4rem;">${title}</h2>
                    <p style="color:#a4b0be; margin-bottom:25px; line-height:1.5; font-size:0.95rem;">${text}</p>
                    <div style="display:flex; justify-content:center;">
                        ${cancelBtnHtml}
                        <button id="alertConfirmBtn" style="padding:10px 28px; background:${color}; color:${type==='confirm'?'#000':'#fff'}; border:none; border-radius:10px; font-size:0.95rem; font-weight:600; cursor:pointer; font-family:'Mitr', sans-serif;">
                            ${type === 'confirm' ? (lang === 'th' ? 'ยืนยัน' : 'Confirm') : 'OK'}
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
                document.getElementById('alertCancelBtn').addEventListener('click', () => alertOverlay.remove());
            }
        }

        btnConfirmPay.addEventListener('click', () => {
            const addr = document.getElementById('chkAddress').value.trim();
            if (!addr) {
                showCustomAlert('error', lang === 'th' ? 'กรุณาระบุที่อยู่จัดส่ง' : 'Address Required', lang === 'th' ? 'กรุณากรอกที่อยู่สำหรับจัดส่งก่อนยืนยันคำสั่งซื้อ' : 'Please provide your shipping address before placing the order.');
                return;
            }

            showCustomAlert('confirm', lang === 'th' ? 'ยืนยันการสั่งซื้อ' : 'Confirm Order', lang === 'th' ? 'ต้องการยืนยันคำสั่งซื้อนี้ใช่หรือไม่?' : 'Are you sure you want to place this order?', async () => {
                btnConfirmPay.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${lang === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}`;
                btnConfirmPay.disabled = true;
                btnConfirmPay.style.opacity = '0.7';

                const username = currentUser ? (currentUser.username || currentUser.email || 'Guest') : 'Guest';
                const orderPayload = {
                    id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
                    date: new Date().toISOString(),
                    total: total,
                    items: cart,
                    status: 'Processing',
                    address: addr,
                    payment: chkMethod.value,
                    username: username
                };

                try {
                    await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderPayload)
                    });

                    // Save address to user profile if they didn't have one
                    if (currentUser && !currentUser.address) {
                        currentUser.address = addr;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    }

                    // Clear cart locally & on backend
                    localStorage.setItem('cart', '[]');
                    if (username !== 'Guest') {
                        await fetch('/api/cart/' + encodeURIComponent(username), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cart: [] })
                        });
                    }
                } catch (err) {
                    console.error('Order submission error:', err);
                }

                if (typeof window.updateBadge === 'function') window.updateBadge();
                if (typeof window.renderCart === 'function') window.renderCart();

                overlay.remove();
                showCustomAlert('success', lang === 'th' ? 'สั่งซื้อสำเร็จ!' : 'Order Placed!', lang === 'th' ? `รหัสคำสั่งซื้อของคุณคือ ${orderPayload.id} สามารถตรวจสอบสถานะได้ที่หน้าประวัติการสั่งซื้อ` : `Your order ${orderPayload.id} has been placed successfully!`, () => {
                    window.location.href = 'profile.html';
                });
            }, true);
        });
    }
})();