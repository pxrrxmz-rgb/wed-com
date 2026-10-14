let site_products = [];
let activeCategoryFilter = 'all';
let activeSortOrder = 'default';

async function fetchProductsFromAPI() {
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            site_products = await res.json();
        } else {
            console.error('Failed to load products from API.');
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

function ensureCatalogToolbar(grid, pageDefaultCategory) {
    if (document.getElementById('catalogToolbar')) return;
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const isHomePage = pageDefaultCategory === 'all';

    const toolbar = document.createElement('div');
    toolbar.id = 'catalogToolbar';
    toolbar.className = 'catalog-toolbar';

    const pillsHtml = isHomePage ? `
        <div class="category-pills" id="categoryPills">
            <button class="cat-pill-btn active" data-cat="all">${lang === 'th' ? 'ทั้งหมด' : 'All'}</button>
            <button class="cat-pill-btn" data-cat="laptops">${lang === 'th' ? 'แล็ปท็อป' : 'Laptops'}</button>
            <button class="cat-pill-btn" data-cat="components">${lang === 'th' ? 'ชิ้นส่วนคอม' : 'Components'}</button>
            <button class="cat-pill-btn" data-cat="prebuilds">${lang === 'th' ? 'คอมเซ็ต' : 'Pre-builds'}</button>
            <button class="cat-pill-btn" data-cat="deals">${lang === 'th' ? 'โปรโมชั่น' : 'Deals'}</button>
        </div>
    ` : `<div></div>`;

    toolbar.innerHTML = `
        ${pillsHtml}
        <div class="toolbar-right">
            <span class="product-count-label" id="productCountLabel"></span>
            <select id="sortSelect" class="sort-select">
                <option value="default">${lang === 'th' ? 'เรียงตาม: แนะนำ' : 'Sort: Featured'}</option>
                <option value="price-asc">${lang === 'th' ? 'ราคา: ต่ำ -> สูง' : 'Price: Low to High'}</option>
                <option value="price-desc">${lang === 'th' ? 'ราคา: สูง -> ต่ำ' : 'Price: High to Low'}</option>
                <option value="name-asc">${lang === 'th' ? 'ชื่อ: A - Z' : 'Name: A - Z'}</option>
            </select>
        </div>
    `;

    grid.parentNode.insertBefore(toolbar, grid);

    // Bind category pills
    toolbar.querySelectorAll('.cat-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toolbar.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategoryFilter = btn.getAttribute('data-cat');
            renderProductGrid('productGrid', activeCategoryFilter);
        });
    });

    // Bind sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeSortOrder = e.target.value;
            renderProductGrid('productGrid', activeCategoryFilter);
        });
    }
}

function updateToolbarLabels() {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const pills = document.querySelectorAll('#categoryPills .cat-pill-btn');
    const labels = {
        all: lang === 'th' ? 'ทั้งหมด' : 'All',
        laptops: lang === 'th' ? 'แล็ปท็อป' : 'Laptops',
        components: lang === 'th' ? 'ชิ้นส่วนคอม' : 'Components',
        prebuilds: lang === 'th' ? 'คอมเซ็ต' : 'Pre-builds',
        deals: lang === 'th' ? 'โปรโมชั่น' : 'Deals'
    };
    pills.forEach(btn => {
        const cat = btn.getAttribute('data-cat');
        if (labels[cat]) btn.textContent = labels[cat];
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && sortSelect.options.length >= 4) {
        sortSelect.options[0].text = lang === 'th' ? 'เรียงตาม: แนะนำ' : 'Sort: Featured';
        sortSelect.options[1].text = lang === 'th' ? 'ราคา: ต่ำ -> สูง' : 'Price: Low to High';
        sortSelect.options[2].text = lang === 'th' ? 'ราคา: สูง -> ต่ำ' : 'Price: High to Low';
        sortSelect.options[3].text = lang === 'th' ? 'ชื่อ: A - Z' : 'Name: A - Z';
    }
}

function renderProductGrid(containerId, categoryFilter = 'all') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    let products = [...getProducts()];
    if (categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }

    // Apply search filter if searchInput has text
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        products = products.filter(p =>
            (p.title_en && p.title_en.toLowerCase().includes(searchTerm)) ||
            (p.title_th && p.title_th.toLowerCase().includes(searchTerm)) ||
            (p.desc_en && p.desc_en.toLowerCase().includes(searchTerm)) ||
            (p.desc_th && p.desc_th.toLowerCase().includes(searchTerm))
        );
    }

    // Apply sorting
    if (activeSortOrder === 'price-asc') {
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeSortOrder === 'price-desc') {
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (activeSortOrder === 'name-asc') {
        products.sort((a, b) => (a.title_en || '').localeCompare(b.title_en || ''));
    }

    grid.innerHTML = '';
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    const addToCartText = lang === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to Cart';

    const countLabel = document.getElementById('productCountLabel');
    if (countLabel) {
        countLabel.textContent = lang === 'th' ? `${products.length} รายการ` : `${products.length} items`;
    }

    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #8c92a0;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #57606f; margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem;">${lang === 'th' ? 'ไม่พบสินค้าที่ค้นหา' : 'No products found'}</p>
            </div>
        `;
        return;
    }

    products.forEach(p => {
        const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
        const desc = lang === 'th' && p.desc_th ? p.desc_th : p.desc_en;
        const numPrice = Number(p.price || 0);

        let priceHtml = '';
        if (p.category === 'deals') {
            const oldPrice = (numPrice * 1.3).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            priceHtml = `<span class="old-price">฿${oldPrice}</span> <span style="color:#ff4d4d;">฿${numPrice.toLocaleString('en-US')}</span>`;
        } else {
            priceHtml = `฿${numPrice.toLocaleString('en-US')}`;
        }

        const card = document.createElement('div');
        card.className = 'product-card glass-card';
        card.setAttribute('data-id', p.id);
        card.setAttribute('data-title', title);
        card.setAttribute('data-price', numPrice);

        const saleBadge = p.category === 'deals' ? `<span class="card-sale-badge">SALE</span>` : '';
        let mediaHtml = '';
        if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
            mediaHtml = `
                <div class="product-img-wrap" onclick="openProductDetail('${p.id}')">
                    ${saleBadge}
                    <img src="${p.icon}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=TechGear'">
                </div>
            `;
        } else {
            mediaHtml = `<div class="product-icon" style="cursor: pointer;" onclick="openProductDetail('${p.id}')"><i class="${p.icon || 'fas fa-microchip'}"></i></div>`;
        }

        card.innerHTML = `
            ${mediaHtml}
            <h3 class="p-title" style="cursor: pointer;" onclick="openProductDetail('${p.id}')">${title}</h3>
            <p>${desc || ''}</p>
            <div class="price">${priceHtml}</div>
            <button class="btn-add"><i class="fas fa-cart-plus"></i> ${addToCartText}</button>
        `;

        const btnAdd = card.querySelector('.btn-add');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.addToCart === 'function') {
                    window.addToCart(p, 1);
                }
            });
        }
        grid.appendChild(card);
    });
}

function openProductDetail(id) {
    window.location.href = 'product.html?id=' + encodeURIComponent(id);
}

function renderSingleProductPage(id) {
    const products = getProducts();
    const p = products.find(x => String(x.id) === String(id));
    const container = document.getElementById('productContainer');
    if (!container) return;

    const lang = localStorage.getItem('preferredLanguage') || 'en';

    if (!p) {
        container.innerHTML = `
            <div style="text-align:center; padding:100px 20px; color:white;">
                <i class="fas fa-exclamation-triangle" style="font-size:3.5rem; color:#c02020; margin-bottom:20px;"></i>
                <h1>${lang === 'th' ? 'ไม่พบข้อมูลสินค้า' : 'Product Not Found'}</h1>
                <a href="index.html" class="btn-primary-pill" style="margin-top:20px; display:inline-flex;">
                    <i class="fas fa-arrow-left"></i> ${lang === 'th' ? 'กลับหน้าแรก' : 'Go Back Home'}
                </a>
            </div>`;
        return;
    }

    const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
    const desc = lang === 'th' && p.desc_th ? p.desc_th : p.desc_en;
    const fullDesc = lang === 'th' && p.full_th ? p.full_th : (p.full_en || '');
    const numPrice = Number(p.price || 0);

    let priceDisplay = `฿${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (p.category === 'deals') {
        const oldPrice = numPrice * 1.3;
        const discountPct = Math.round((1 - (numPrice / oldPrice)) * 100);
        priceDisplay = `
            <div style="font-size:1.15rem; color:#8c92a0; text-decoration:line-through; margin-bottom:5px;">฿${oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span>฿${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span style="background: rgba(192, 32, 32, 0.2); color: #ff4d4d; padding: 4px 10px; border-radius: 6px; font-size: 0.95rem; font-weight: bold;">-${discountPct}%</span>
            </div>
        `;
    }

    let adminImageEditHtml = '';
    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        adminImageEditHtml = `
            <button onclick="openProductEditModal('${p.id}')" style="position:absolute; top:20px; left:20px; background:rgba(192,32,32,0.9); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:bold; z-index:10; backdrop-filter:blur(5px); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                <i class="fas fa-edit"></i> ${lang === 'th' ? 'แก้ไขสินค้า' : 'Edit Product'}
            </button>
        `;

        if (!document.getElementById('adminInlineEditModal')) {
            const modalDiv = document.createElement('div');
            modalDiv.id = 'adminInlineEditModal';
            modalDiv.innerHTML = `
                <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:10000; display:none; justify-content:center; align-items:center; backdrop-filter:blur(10px);">
                    <div style="background:#18191c; border:1px solid rgba(255,255,255,0.1); padding:35px; border-radius:16px; width:90%; max-width:600px; max-height:90vh; overflow-y:auto; color:white; font-family: 'Mitr', sans-serif;">
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
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Price (฿)</label>
                        <input type="number" id="edit_price" step="0.01" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (EN)</label>
                        <input type="text" id="edit_desc_en" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (TH)</label>
                        <input type="text" id="edit_desc_th" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                        <label style="display:block; margin-bottom:5px; color:#a4b0be;">Full Details</label>
                        <textarea id="edit_full_en" rows="4" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;"></textarea>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button onclick="closeProductEditModal()" style="padding:10px 20px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:white; cursor:pointer;">Cancel</button>
                            <button id="adminInlineSaveBtn" style="padding:10px 20px; border-radius:8px; border:none; background:#c02020; color:white; cursor:pointer; font-weight:bold;">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalDiv);
        }

        window.openProductEditModal = function(targetId) {
            const prod = getProducts().find(x => String(x.id) === String(targetId));
            if (prod) {
                document.getElementById('edit_icon').value = prod.icon || '';
                document.getElementById('edit_title_en').value = prod.title_en || '';
                document.getElementById('edit_title_th').value = prod.title_th || '';
                document.getElementById('edit_price').value = prod.price || 0;
                document.getElementById('edit_desc_en').value = prod.desc_en || '';
                document.getElementById('edit_desc_th').value = prod.desc_th || prod.desc_en || '';
                document.getElementById('edit_full_en').value = prod.full_en || '';
                const saveBtn = document.getElementById('adminInlineSaveBtn');
                saveBtn.onclick = () => window.saveProductEdit(targetId);
                document.getElementById('adminInlineEditModal').firstElementChild.style.display = 'flex';
            }
        };

        window.closeProductEditModal = function() {
            document.getElementById('adminInlineEditModal').firstElementChild.style.display = 'none';
        };

        window.saveProductEdit = async function(prodId) {
            const updatedData = {
                icon: document.getElementById('edit_icon').value,
                title_en: document.getElementById('edit_title_en').value,
                title_th: document.getElementById('edit_title_th').value,
                price: parseFloat(document.getElementById('edit_price').value),
                desc_en: document.getElementById('edit_desc_en').value,
                desc_th: document.getElementById('edit_desc_th').value,
                full_en: document.getElementById('edit_full_en').value,
                full_th: document.getElementById('edit_full_en').value
            };
            try {
                await fetch('/api/products/' + prodId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                window.location.reload();
            } catch (err) {
                alert('Failed to save to database');
            }
        };
    }

    let mediaContent = '';
    if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
        mediaContent = `<img src="${p.icon}" alt="${title}" style="width:100%;height:100%;object-fit:contain;">`;
    } else {
        mediaContent = `<i class="${p.icon || 'fas fa-box'}" style="font-size:8rem;color:#c02020;"></i>`;
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
            padding-top: 20px;
            padding-bottom: 80px;
            text-align: left;
            color: #ffffff;
        }
        .w-left { flex: 1; min-width: 0; }
        .w-image-container {
            background: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 35px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            aspect-ratio: 16/10;
            margin-bottom: 30px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.45);
        }
        .w-desc {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 25px;
        }
        .w-desc h3 { margin-bottom: 12px; color: #fff; font-size: 1.2rem; }
        .w-desc p { color: #a4b0be; line-height: 1.7; font-size: 1rem; }
        .w-right {
            width: 420px;
            flex-shrink: 0;
            background: rgba(18, 20, 24, 0.85);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            position: sticky;
            top: 100px;
        }
        .w-brand-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .w-brand { color: #8c92a0; font-size: 0.9rem; font-weight: 600; }
        .w-stock {
            color: #2ecc71;
            border: 1px solid rgba(46,204,113,0.4);
            background: rgba(46, 204, 113, 0.12);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
        }
        .w-title { font-size: 1.8rem; font-weight: 600; color: #ffffff; margin-bottom: 8px; line-height: 1.25; }
        .w-subtitle { color: #a4b0be; font-size: 0.92rem; margin-bottom: 22px; text-transform: uppercase; letter-spacing: 0.5px; }
        .w-price { font-size: 2rem; font-weight: 700; color: #c02020; margin-bottom: 22px; }
        .w-btn-add {
            width: 100%;
            background: #c02020;
            color: #ffffff;
            border: none;
            padding: 15px;
            border-radius: 12px;
            font-size: 1.05rem;
            font-weight: 600;
            font-family: 'Mitr', sans-serif;
            cursor: pointer;
            transition: 0.3s;
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .w-btn-add:hover {
            background: #d62828;
            box-shadow: 0 6px 20px rgba(192,32,32,0.45);
        }
        .w-feature-list {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 18px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            color: #a4b0be;
            font-size: 0.92rem;
        }
        .w-feature-item { display: flex; align-items: center; gap: 12px; }
        .w-feature-item i { color: #c02020; width: 20px; text-align: center; }
        @media (max-width: 900px) {
            .w-layout { flex-direction: column; }
            .w-right { width: 100%; position: static; }
        }
    </style>

    <div style="max-width:1200px; margin:0 auto 15px;">
        <a href="javascript:history.back()" style="color:#a4b0be; text-decoration:none; font-size:0.95rem; display:inline-flex; align-items:center; gap:8px;">
            <i class="fas fa-arrow-left"></i> ${lang === 'th' ? 'ย้อนกลับ' : 'Back'}
        </a>
    </div>

    <div class="w-layout">
        <div class="w-left">
            <div class="w-image-container">
                ${adminImageEditHtml}
                ${mediaContent}
            </div>
            <div class="w-desc">
                <h3>${lang === 'th' ? 'รายละเอียดสเปกสินค้า' : 'Product Specifications'}</h3>
                ${fullDesc ? fullDesc.split('\n').map(line => line.trim() ? `<p style="margin-bottom: 10px;">${line}</p>` : '').join('') : `<p>${desc}</p>`}
            </div>
        </div>

        <div class="w-right">
            <div class="w-brand-row">
                <span class="w-brand">TECHGEAR OFFICIAL</span>
                <span class="w-stock"><i class="fas fa-check-circle"></i> ${lang === 'th' ? 'มีสินค้าพร้อมส่ง' : 'In Stock'}</span>
            </div>

            <h1 class="w-title">${title}</h1>
            <div class="w-subtitle">${getMsg('cat_' + p.category) || p.category}</div>

            <div class="w-price">${priceDisplay}</div>

            <button class="w-btn-add add-to-cart-detail">
                <i class="fas fa-cart-plus"></i> ${lang === 'th' ? 'เพิ่มลงตะกร้าสินค้า' : 'Add to Cart'}
            </button>

            <div class="w-feature-list">
                <div class="w-feature-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>${lang === 'th' ? 'รับประกันศูนย์แท้ 2 ปีเต็ม' : '2-Year Official Warranty'}</span>
                </div>
                <div class="w-feature-item">
                    <i class="fas fa-truck-fast"></i>
                    <span>${lang === 'th' ? 'จัดส่งด่วนทั่วประเทศ แพ็คกันกระแทกอย่างดี' : 'Fast Nationwide Delivery'}</span>
                </div>
                <div class="w-feature-item">
                    <i class="fas fa-rotate-left"></i>
                    <span>${lang === 'th' ? 'เปลี่ยนคืนสินค้าได้ภายใน 30 วัน' : '30-Day Easy Return Policy'}</span>
                </div>
            </div>
        </div>
    </div>`;

    const addBtn = container.querySelector('.add-to-cart-detail');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (typeof window.addToCart === 'function') {
                window.addToCart(p, 1);
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

        activeCategoryFilter = category;
        ensureCatalogToolbar(grid, category);
        renderProductGrid('productGrid', activeCategoryFilter);
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
});

window.addEventListener('languageChanged', () => {
    if (typeof site_products === 'undefined' || site_products.length === 0) return;
    updateToolbarLabels();

    const grid = document.getElementById('productGrid');
    if (grid) {
        renderProductGrid('productGrid', activeCategoryFilter);
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