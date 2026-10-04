const fs = require('fs');

const content = fs.readFileSync('products.js', 'utf-8');

const targetStr = "let mediaContent = '';";
const idx = content.indexOf(targetStr);

if (idx === -1) {
    console.log('Target string not found');
    process.exit(1);
}

const adminLogic = `
    let adminImageEditHtml = '';
    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        adminImageEditHtml = \`
            <button onclick="openProductEditModal()" style="position:absolute; top:20px; left:20px; background:rgba(192,32,32,0.9); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:bold; z-index:10; backdrop-filter:blur(5px); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                <i class="fas fa-edit"></i> Edit Product
            </button>
        \`;
        
        if (!document.getElementById('adminInlineEditModal')) {
            const modalDiv = document.createElement('div');
            modalDiv.id = 'adminInlineEditModal';
            modalDiv.innerHTML = \`
                <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:10000; display:none; justify-content:center; align-items:center; backdrop-filter:blur(10px);">
                    <div style="background:#111; border:1px solid rgba(255,255,255,0.1); padding:40px; border-radius:16px; width:90%; max-width:600px; max-height:90vh; overflow-y:auto; color:white; font-family:sans-serif;">
                        <h2 style="margin-bottom:20px; color:#c02020;">Admin: Edit Product</h2>
                        
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Image URL / Icon Class</label>
                        <input type="text" id="edit_icon" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        
                        <div style="display:flex; gap:15px;">
                            <div style="flex:1;">
                                <label style="display:block; margin-bottom:5px; color:#a4b0be;">Title (EN)</label>
                                <input type="text" id="edit_title_en" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                            </div>
                            <div style="flex:1;">
                                <label style="display:block; margin-bottom:5px; color:#a4b0be;">Title (TH)</label>
                                <input type="text" id="edit_title_th" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                            </div>
                        </div>

                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Price (USD)</label>
                        <input type="number" id="edit_price" step="0.01" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (EN)</label>
                        <input type="text" id="edit_desc_en" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Full Details (EN)</label>
                        <textarea id="edit_full_en" rows="4" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;"></textarea>
                        
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button onclick="closeProductEditModal()" style="padding:10px 20px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:white; cursor:pointer;">Cancel</button>
                            <button onclick="saveProductEdit('\${id}')" style="padding:10px 20px; border-radius:8px; border:none; background:#c02020; color:white; cursor:pointer; font-weight:bold;">Save Changes</button>
                        </div>
                    </div>
                </div>
            \`;
            document.body.appendChild(modalDiv);
            
            window.openProductEditModal = function() {
                const products = JSON.parse(localStorage.getItem('site_products'));
                const prod = products.find(x => x.id === '\${id}');
                if(prod) {
                    document.getElementById('edit_icon').value = prod.icon || '';
                    document.getElementById('edit_title_en').value = prod.title_en || '';
                    document.getElementById('edit_title_th').value = prod.title_th || '';
                    document.getElementById('edit_price').value = prod.price || 0;
                    document.getElementById('edit_desc_en').value = prod.desc_en || '';
                    document.getElementById('edit_full_en').value = prod.full_en || '';
                    document.getElementById('adminInlineEditModal').firstElementChild.style.display = 'flex';
                }
            };
            
            window.closeProductEditModal = function() {
                document.getElementById('adminInlineEditModal').firstElementChild.style.display = 'none';
            };
            
            window.saveProductEdit = function(prodId) {
                const products = JSON.parse(localStorage.getItem('site_products'));
                const index = products.findIndex(x => x.id === prodId);
                if(index !== -1) {
                    products[index].icon = document.getElementById('edit_icon').value;
                    products[index].title_en = document.getElementById('edit_title_en').value;
                    products[index].title_th = document.getElementById('edit_title_th').value;
                    products[index].price = parseFloat(document.getElementById('edit_price').value);
                    products[index].desc_en = document.getElementById('edit_desc_en').value;
                    products[index].full_en = document.getElementById('edit_full_en').value;
                    localStorage.setItem('site_products', JSON.stringify(products));
                    window.location.reload();
                }
            };
        }
    }

    let mediaContent = '';
`;

let newContent = content.substring(0, idx) + adminLogic + content.substring(idx + targetStr.length);

// Also inject ${adminImageEditHtml} into the layout string
const injectPoint = '<div class="w-image-container">';
const newInject = injectPoint + '\\n                ${adminImageEditHtml}';
newContent = newContent.replace(injectPoint, newInject);

fs.writeFileSync('products.js', newContent, 'utf-8');
console.log('Update admin successfully');
