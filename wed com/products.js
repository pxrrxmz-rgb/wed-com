let site_products = [];

async function fetchProductsFromAPI() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        if (res.ok) {
            site_products = await res.json();
        } else {
            console.error('Failed to load products from API, backend might be down.');
        }
    } catch (err) {
        console.error('Error connecting to backend:', err);
    }
}




function getProducts() {
    return site_products;
}

function saveProducts(prods) {
    localStorage.setItem('site_products', JSON.stringify(prods));
}

function renderProductGrid(containerId, categoryFilter = 'all') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    let products = getProducts();
    if (categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }

    grid.innerHTML = '';
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const addToCartText = lang === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to Cart';

    products.forEach(p => {
        const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
        const desc = lang === 'th' && p.desc_th ? p.desc_th : p.desc_en;
        
        let priceHtml = '';
        if (p.category === 'deals') {
            const oldPrice = (p.price * 1.3).toFixed(2);
            priceHtml = `<span class="old-price">฿${oldPrice}</span> ฿${p.price.toFixed(2)}`;
        } else {
            priceHtml = `฿${p.price.toFixed(2)}`;
        }

        const card = document.createElement('div');
        card.className = 'product-card glass-card';
        card.setAttribute('data-id', p.id);
        card.setAttribute('data-title', title);
        card.setAttribute('data-price', p.price);

        let mediaHtml = '';
        if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
            mediaHtml = `<img src="${p.icon}" alt="${title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 10px; margin-bottom: 15px; cursor: pointer;" onclick="openProductDetail('${p.id}')">`;
        } else {
            mediaHtml = `<div class="product-icon" style="cursor: pointer;" onclick="openProductDetail('${p.id}')"><i class="${p.icon}"></i></div>`;
        }

        card.innerHTML = `
            ${mediaHtml}
            <h3 class="p-title" style="cursor: pointer;" onclick="openProductDetail('${p.id}')">${title}</h3>
            <p>${desc}</p>
            <div class="price">${priceHtml}</div>
            <button class="btn-add">${addToCartText}</button>
        `;

        const btnAdd = card.querySelector('.btn-add');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) {
                    const lang = localStorage.getItem('preferredLanguage') || 'en';
                    if (typeof showToast === 'function') {
                        showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.', true);
                    } else {
                        alert(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.');
                    }
                    setTimeout(() => window.location.href = 'login.html', 1500);
                    return;
                }

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
                const cUser = JSON.parse(localStorage.getItem('currentUser'));
                if (cUser && cUser.username) {
                    fetch('/api/cart/' + cUser.username, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cart: cart })
                    }).catch(e => console.error(e));
                }

                
                if (typeof window.updateBadge === 'function') {
                    window.updateBadge();
                } else {
                    const badge = document.getElementById('cartBadge');
                    const count = cart.reduce((sum, i) => sum + i.qty, 0);
                    if (badge) {
                        badge.textContent = count;
                        badge.style.display = count > 0 ? 'inline-block' : 'none';
                    }
                }
                
                if (typeof window.renderCart === 'function') window.renderCart();
                
                if (typeof showToast === 'function') {
                    showToast(lang === 'th' ? `เพิ่ม ${title} ลงตะกร้าแล้ว!` : `Added ${title} to cart!`);
                } else {
                    alert(lang === 'th' ? `เพิ่ม ${title} ลงตะกร้าแล้ว!` : `Added ${title} to cart!`);
                }
            });
        }
        grid.appendChild(card);
    });
}

function openProductDetail(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        if (typeof showToast === 'function') {
            showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.', true);
        } else {
            alert(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.');
        }
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    window.location.href = 'product.html?id=' + id;
}

function renderSingleProductPage(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        if (typeof showToast === 'function') {
            showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.', true);
        } else {
            alert(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.');
        }
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    const products = getProducts();
    const p = products.find(x => x.id === id);
    const container = document.getElementById('productContainer');
    
    if(!p) {
        container.innerHTML = '<div style="text-align:center; padding:100px; color:white;"><h1>Product Not Found</h1><a href="index.html" class="btn-primary-pill" style="margin-top:20px; display:inline-block;">Go Back Home</a></div>';
        return;
    }
    
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
    const desc = lang === 'th' && p.desc_th ? p.desc_th : p.desc_en;
    const fullDesc = lang === 'th' && p.full_th ? p.full_th : (p.full_en || '');
    
    let priceDisplay = `${p.price.toFixed(2)}`;
    if (p.category === 'deals') {
        const oldPrice = (p.price * 1.3).toFixed(2);
        const discountPct = Math.round((1 - (p.price / oldPrice)) * 100);
        priceDisplay = `
            <div style="font-size:1.2rem; color:#8c92a0; text-decoration:line-through; margin-bottom:5px;">${oldPrice}</div>
            <div style="display:flex; align-items:center; gap:15px;">
                ${p.price.toFixed(2)}
                <span style="background: rgba(192, 32, 32, 0.2); color: #c02020; padding: 4px 10px; border-radius: 4px; font-size: 1rem; font-weight: bold;">${discountPct}% OFF</span>
            </div>
        `;
    }
    
    
    let adminImageEditHtml = '';
    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        adminImageEditHtml = `
            <button onclick="openProductEditModal()" style="position:absolute; top:20px; left:20px; background:rgba(192,32,32,0.9); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:bold; z-index:10; backdrop-filter:blur(5px); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                <i class="fas fa-edit"></i> Edit Product
            </button>
        `;
        
        if (!document.getElementById('adminInlineEditModal')) {
            const modalDiv = document.createElement('div');
            modalDiv.id = 'adminInlineEditModal';
            modalDiv.innerHTML = `
                <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:10000; display:none; justify-content:center; align-items:center; backdrop-filter:blur(10px);">
                    <div style="background:#111; border:1px solid rgba(255,255,255,0.1); padding:40px; border-radius:16px; width:90%; max-width:600px; max-height:90vh; overflow-y:auto; color:white; font-family: 'Mitr', sans-serif;">
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
                            <button onclick="saveProductEdit('${id}')" style="padding:10px 20px; border-radius:8px; border:none; background:#c02020; color:white; cursor:pointer; font-weight:bold;">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalDiv);
            
            window.openProductEditModal = function() {
                const products = JSON.parse(localStorage.getItem('site_products'));
                const prod = products.find(x => x.id === '${id}');
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

    if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
        mediaContent = `<img src="${p.icon}" style="width:100%;height:100%;object-fit:contain;">`;
    } else {
        mediaContent = `<i class="${p.icon || 'fas fa-box'}" style="font-size:8rem;color:#555;"></i>`;
    }

    container.innerHTML = `
    <style>
        .w-layout {
            display: flex;
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
            align-items: flex-start;
            font-family: 'Mitr', sans-serif;
            padding-top: 50px;
            padding-bottom: 100px;
            text-align: left;
            color: #ffffff;
        }
        .w-left {
            flex: 1;
            min-width: 0;
        }
        .w-image-container {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            aspect-ratio: 16/10;
            margin-bottom: 40px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .w-pill {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(192, 32, 32, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 700;
            backdrop-filter: blur(10px);
        }
        
        .w-desc h2 {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #ffffff;
        }
        .w-desc p {
            color: #a4b0be;
            line-height: 1.7;
            margin-bottom: 20px;
            font-size: 1.05rem;
        }
        
        .w-right {
            width: 420px;
            flex-shrink: 0;
            background: rgba(15, 16, 18, 0.7);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            position: sticky;
            top: 120px;
        }
        .w-brand-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .w-brand {
            color: #8c92a0;
            font-size: 0.95rem;
            font-weight: 700;
        }
        .w-stock {
            color: #00C300;
            border: 1px solid #00C300;
            background: rgba(0, 195, 0, 0.1);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        
        .w-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        .w-subtitle {
            color: #a4b0be;
            font-size: 1.05rem;
            margin-bottom: 30px;
        }
        
        .w-price {
            font-size: 2.2rem;
            font-weight: 700;
            color: #c02020;
            margin-bottom: 25px;
        }
        
        .w-btn-add {
            width: 100%;
            background: rgba(192, 32, 32, 0.1);
            color: #c02020;
            border: 2px solid #c02020;
            padding: 16px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s;
            margin-bottom: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .w-btn-add:hover {
            background: rgba(192, 32, 32, 0.3);
            box-shadow: 0 4px 15px rgba(192,32,32,0.4);
        }
        
        .w-tax-info {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 25px 0;
            border-top: 1px solid rgba(255,255,255,0.1);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 15px;
        }
        .w-tax-flag {
            font-size: 1.8rem;
            line-height: 1;
        }
        .w-tax-text {
            flex: 1;
            font-size: 0.9rem;
            color: #8c92a0;
            line-height: 1.5;
        }
        .w-tax-btn {
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05);
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #fff;
            cursor: pointer;
            transition: 0.3s;
        }
        .w-tax-btn:hover {
            background: rgba(255,255,255,0.1);
        }
        
        .w-accordion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            color: #a4b0be;
            font-size: 0.95rem;
            cursor: pointer;
            transition: 0.3s;
        }
        .w-accordion:hover {
            color: #fff;
        }
        .w-accordion:last-child {
            border-bottom: none;
        }
        .w-accordion i {
            color: #c02020;
            font-size: 0.8rem;
        }
        
        @media (max-width: 900px) {
            .w-layout { flex-direction: column; }
            .w-right { width: 100%; position: static; }
        }
    </style>
    
    <div class="w-layout">
        <div class="w-left">
            <div class="w-image-container">\n                ${adminImageEditHtml}
                ${mediaContent}
                <div class="w-pill">+2 more images</div>
            </div>
            
            <div class="w-desc">
                ${fullDesc ? fullDesc.split('\n').map(line => line.trim() ? `<p style="margin-bottom: 15px; line-height: 1.6;">${line}</p>` : '').join('') : `<p>${desc}</p>`}
            </div>
        </div>
        
        <div class="w-right">
            <div class="w-brand-row">
                <span class="w-brand">TECH GEAR</span>
                <span class="w-stock">In stock</span>
            </div>
            
            <h1 class="w-title">${title}</h1>
            <div class="w-subtitle">Exclusive 60% Keycaps</div>
            
            <div class="w-price">${priceDisplay}</div>
            
            <button class="w-btn-add add-to-cart-detail" data-id="${p.id}" data-name="${title}" data-price="${p.price}">
                <i class="fas fa-cart-plus"></i> Add to cart
            </button>
            
            <div class="w-tax-info">
                <div class="w-tax-flag">🇹🇭</div>
                <div class="w-tax-text">Prices exclude import duties and taxes.<br>Duties and taxes are collected at checkout.</div>
                <button class="w-tax-btn">Learn more</button>
            </div>
            
            <div class="w-accordion">
                <span>2-Year Warranty</span>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="w-accordion">
                <span>Worldwide Shipping</span>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="w-accordion">
                <span>30-Day Return</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    </div>`;

    const addBtn = container.querySelector('.add-to-cart-detail');
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        if (typeof showToast === 'function') {
            showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.', true);
        } else {
            alert(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.');
        }
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
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
                const cUser = JSON.parse(localStorage.getItem('currentUser'));
                if (cUser && cUser.username) {
                    fetch('/api/cart/' + cUser.username, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cart: cart })
                    }).catch(e => console.error(e));
                }

            
            // Update UI manually
            if (typeof window.updateBadge === 'function') {
                window.updateBadge();
            } else {
                const badge = document.getElementById('cartBadge');
                const count = cart.reduce((sum, i) => sum + i.qty, 0);
                if (badge) {
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            }
            
            if (typeof showToast === 'function') {
                showToast(`Added ${item.title} to cart!`);
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
window.openProductDetail = openProductDetail;
window.renderSingleProductPage = renderSingleProductPage;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchProductsFromAPI();
    
    const grid = document.getElementById('productGrid');
    if (grid) {
        const path = window.location.pathname;
        let category = 'all';
        if (path.includes('components.html')) category = 'components';
        else if (path.includes('prebuilds.html')) category = 'prebuilds';
        else if (path.includes('laptops.html')) category = 'laptops';
        else if (path.includes('deals.html')) category = 'deals';
        renderProductGrid('productGrid', category);
    }

    const container = document.getElementById('productContainer');
    if (container) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            renderSingleProductPage(id);
        } else {
            container.innerHTML = '<div style="text-align:center; padding:100px; color:white;"><h1>No Product Selected</h1><a href="index.html" class="btn-primary-pill" style="margin-top:20px; display:inline-block;">Go Back Home</a></div>';
        }
    }

    window.dispatchEvent(new Event('languageChanged'));
});

window.addEventListener('languageChanged', () => {
    if (typeof site_products === 'undefined' || site_products.length === 0) return;
    
    const grid = document.getElementById('productGrid');
    if (grid) {
        const path = window.location.pathname;
        let category = 'all';
        if (path.includes('components.html')) category = 'components';
        else if (path.includes('prebuilds.html')) category = 'prebuilds';
        else if (path.includes('laptops.html')) category = 'laptops';
        else if (path.includes('deals.html')) category = 'deals';
        renderProductGrid('productGrid', category);
    }
    
    const container = document.getElementById('productContainer');
    if (container) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            renderSingleProductPage(id);
        }
    }
});
