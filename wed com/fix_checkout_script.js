const fs = require('fs');
let content = fs.readFileSync('checkout.js', 'utf8');

// Remove DOMContentLoaded wrapper
content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "");
// Remove the last closing bracket and parenthesis of the wrapper
const lastBraceIndex = content.lastIndexOf("});");
if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + content.substring(lastBraceIndex + 3);
}

// Ensure bindCheckout is called immediately
content = content.replace("function bindCheckout() {", "bindCheckout();\nfunction bindCheckout() {");

// Add language support to the modal HTML
const modalHtmlRegex = /const modalHtml = `([\s\S]*?)`;/m;
const modalHtmlMatch = content.match(modalHtmlRegex);

if (modalHtmlMatch) {
    let newModalHtml = `
    const lang = localStorage.getItem('language') || 'en';
    const textSecureCheckout = lang === 'th' ? 'การชำระเงินที่ปลอดภัย' : 'Secure Checkout';
    const textOrderSummary = lang === 'th' ? 'สรุปคำสั่งซื้อ' : 'Order Summary';
    const textTotal = lang === 'th' ? 'ยอดรวมทั้งหมด' : 'Total';
    const textShipping = lang === 'th' ? 'ที่อยู่สำหรับจัดส่ง' : 'Shipping Address';
    const textAddressPh = lang === 'th' ? '123 ถนน, เมือง, รหัสไปรษณีย์' : '123 Street, City, Zip Code';
    const textPayment = lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method';
    const textCard = lang === 'th' ? 'บัตรเครดิต/เดบิต' : 'Credit/Debit Card';
    const textPromptpay = lang === 'th' ? 'พร้อมเพย์ (QR Code)' : 'PromptPay (QR Code)';
    const textConfirmPay = lang === 'th' ? 'ยืนยันการชำระเงิน' : 'Confirm Payment';
    
    const modalHtml = \`<div style="background:#1a1c23; border-radius:20px; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; position:relative; animation: slideUp 0.4s ease;">
        <button id="closeCheckout" style="position:absolute; top:20px; right:25px; background:transparent; border:none; color:#a4b0be; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
        
        <div style="padding:30px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <h2 style="color:white; margin:0;"><i class="fas fa-lock" style="color:#00C300; margin-right:10px;"></i> \${textSecureCheckout}</h2>
        </div>

        <div style="display:flex; flex-wrap:wrap; padding:30px; gap:30px;">
            <div style="flex:1; min-width:300px;">
                <h3 style="color:white; margin-bottom:15px;">\${textOrderSummary}</h3>
                <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; color:white; font-size:1.2rem; font-weight:bold; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                        <span>\${textTotal}</span>
                        <span style="color:#c02020;">$\${total.toFixed(2)}</span>
                    </div>
                </div>

                <h3 style="color:white; margin-bottom:15px;">\${textShipping}</h3>
                <textarea id="chkAddress" placeholder="\${textAddressPh}" style="width:100%; padding:15px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; font-family:inherit; margin-bottom:20px; min-height:100px; resize:vertical;"></textarea>
            </div>

            <div style="flex:1; min-width:300px;">
                <h3 style="color:white; margin-bottom:15px;">\${textPayment}</h3>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <select id="chkMethod" style="width:100%; padding:15px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; font-family:inherit; cursor:pointer;">
                        <option value="card" style="background:#1a1c23;">\${textCard}</option>
                        <option value="promptpay" style="background:#1a1c23;">\${textPromptpay}</option>
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
                        \${textConfirmPay} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    \`;`;
    content = content.replace(modalHtmlMatch[0], newModalHtml);
}

// Add language support to the custom alert
const alertRegex = /showCustomAlert\('error', 'Address Required', 'Please provide your shipping address before placing the order.', null, false\);/g;
content = content.replace(alertRegex, "showCustomAlert('error', lang === 'th' ? 'กรุณาระบุที่อยู่' : 'Address Required', lang === 'th' ? 'กรุณาระบุที่อยู่จัดส่งก่อนยืนยันคำสั่งซื้อ' : 'Please provide your shipping address before placing the order.', null, false);");

const confirmRegex = /showCustomAlert\('confirm', 'Confirm Order', 'Are you sure you want to place this order\? Check your details carefully before confirming.',/g;
content = content.replace(confirmRegex, "showCustomAlert('confirm', lang === 'th' ? 'ยืนยันคำสั่งซื้อ' : 'Confirm Order', lang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อ? กรุณาตรวจสอบรายละเอียดก่อนยืนยัน' : 'Are you sure you want to place this order? Check your details carefully before confirming.',");

const successRegex = /showCustomAlert\('success', 'Payment Successful!', 'Your order has been placed successfully. Redirecting to home...',/g;
content = content.replace(successRegex, "showCustomAlert('success', lang === 'th' ? 'ชำระเงินสำเร็จ!' : 'Payment Successful!', lang === 'th' ? 'คำสั่งซื้อของคุณสำเร็จแล้ว กำลังกลับสู่หน้าหลัก...' : 'Your order has been placed successfully. Redirecting to home...',");

fs.writeFileSync('checkout.js', content, 'utf8');
console.log('Fixed checkout.js logic and added language support');
