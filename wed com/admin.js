document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let isEditing = false;
    let adminSearchQuery = '';
    let adminCategoryFilter = 'all';

    const adminPasscode = "admin1234";
    const loginContainer = document.getElementById('adminLoginContainer');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('adminLoginForm');

    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
        injectAdminSearchToolbar();
        fetchAdminProducts();
        renderOrders();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPass').value;
        if (pass === adminPasscode) {
            sessionStorage.setItem('isAdminLogged', 'true');
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            injectAdminSearchToolbar();
            fetchAdminProducts();
            renderOrders();
        } else {
            alert(typeof getMsg === 'function' ? getMsg('msg_incorrect_passcode') : "Incorrect passcode!");
        }
    });

    const tbody = document.getElementById('adminProductList');
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const addBtn = document.getElementById('addBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    function injectAdminSearchToolbar() {
        const secProducts = document.getElementById('sectionProducts');
        if (!secProducts || document.getElementById('adminFilterBar')) return;
        const header = secProducts.querySelector('.admin-header');

        const filterBar = document.createElement('div');
        filterBar.id = 'adminFilterBar';
        filterBar.style.cssText = 'display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;';
        filterBar.innerHTML = `
            <input type="text" id="adminProdSearch" placeholder="ค้นหาชื่อสินค้า / รหัสสินค้า..." style="flex:1; min-width:220px; padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#fff; font-family:'Mitr',sans-serif; outline:none;">
            <select id="adminProdCatFilter" style="padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.15); background:#18191c; color:#fff; font-family:'Mitr',sans-serif; outline:none; cursor:pointer;">
                <option value="all">ทุกหมวดหมู่ (All Categories)</option>
                <option value="laptops">Laptops</option>
                <option value="components">Components</option>
                <option value="prebuilds">Pre-builds</option>
                <option value="deals">Deals</option>
            </select>
        `;
        header.insertAdjacentElement('afterend', filterBar);

        document.getElementById('adminProdSearch').addEventListener('input', (e) => {
            adminSearchQuery = e.target.value.toLowerCase().trim();
            renderTable();
        });
        document.getElementById('adminProdCatFilter').addEventListener('change', (e) => {
            adminCategoryFilter = e.target.value;
            renderTable();
        });
    }

    window.switchAdminTab = function(tabName) {
        const tabProducts = document.getElementById('tabBtnProducts');
        const tabOrders = document.getElementById('tabBtnOrders');
        const secProducts = document.getElementById('sectionProducts');
        const secOrders = document.getElementById('sectionOrders');

        if (tabName === 'products') {
            if (tabProducts) tabProducts.classList.add('active');
            if (tabOrders) tabOrders.classList.remove('active');
            if (secProducts) secProducts.style.display = 'block';
            if (secOrders) secOrders.style.display = 'none';
            renderTable();
        } else {
            if (tabOrders) tabOrders.classList.add('active');
            if (tabProducts) tabProducts.classList.remove('active');
            if (secOrders) secOrders.style.display = 'block';
            if (secProducts) secProducts.style.display = 'none';
            renderOrders();
        }
    };

    async function fetchAdminProducts() {
        try {
            const res = await fetch('/api/products');
            products = await res.json();
            renderTable();
        } catch (err) {
            console.error(err);
            products = typeof getProducts === 'function' ? getProducts() : [];
            renderTable();
        }
    }

    function renderTable() {
        if (!tbody) return;
        tbody.innerHTML = '';
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        let filtered = products.filter(p => {
            const matchCat = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
            const matchText = !adminSearchQuery ||
                String(p.id).toLowerCase().includes(adminSearchQuery) ||
                (p.title_en && p.title_en.toLowerCase().includes(adminSearchQuery)) ||
                (p.title_th && p.title_th.toLowerCase().includes(adminSearchQuery));
            return matchCat && matchText;
        });

        filtered.forEach(p => {
            const tr = document.createElement('tr');
            let iconHtml = '';
            if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
                iconHtml = `<img src="${p.icon}" style="width: 46px; height: 46px; object-fit: contain; background:#fff; padding:3px; border-radius: 8px;">`;
            } else {
                iconHtml = `<i class="${p.icon || 'fas fa-box'}" style="font-size:1.6rem; color:#c02020;"></i>`;
            }

            const mainTitle = (lang === 'th' && p.title_th) ? p.title_th : (p.title_en || 'Product');
            const subTitle = p.desc_th || p.desc_en || '';
            const categoryText = (typeof getMsg === 'function') ? getMsg('cat_' + p.category) : p.category;

            tr.innerHTML = `
                <td>${iconHtml}</td>
                <td><strong>#${p.id} - ${mainTitle}</strong><br><small style="color:#8c92a0;">${subTitle}</small></td>
                <td><span style="background:rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius:12px; font-size:0.8rem; text-transform:uppercase;">${categoryText}</span></td>
                <td><strong style="color:#2ecc71;">฿${Number(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                <td>
                    <button class="action-btn edit" data-id="${p.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.currentTarget.getAttribute('data-id')));
        });
        tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteProduct(e.currentTarget.getAttribute('data-id')));
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            isEditing = false;
            form.reset();
            document.getElementById('pId').value = '';
            document.getElementById('modalTitle').textContent = typeof getMsg === 'function' ? getMsg('modal_add_title') : 'Add New Product';
            modal.classList.add('active');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    function openModal(id) {
        isEditing = true;
        document.getElementById('modalTitle').textContent = typeof getMsg === 'function' ? getMsg('modal_edit_title') : 'Edit Product';
        const p = products.find(x => String(x.id) === String(id));
        if (!p) return;

        document.getElementById('pId').value = p.id;
        document.getElementById('pCat').value = p.category;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pIcon').value = p.icon;
        document.getElementById('pImage').value = p.icon;
        document.getElementById('pImageFile').value = '';
        document.getElementById('pTitleEn').value = p.title_en || '';
        document.getElementById('pTitleTh').value = p.title_th || '';
        document.getElementById('pDescEn').value = p.desc_en || '';
        document.getElementById('pDescTh').value = p.desc_th || '';
        document.getElementById('pFullEn').value = p.full_en || '';
        document.getElementById('pFullTh').value = p.full_th || '';

        modal.classList.add('active');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const saveProduct = async (iconValue) => {
            const maxId = products.reduce((max, item) => Math.max(max, parseInt(item.id, 10) || 0), 0);
            const newProd = {
                id: isEditing ? document.getElementById('pId').value : String(maxId + 1),
                category: document.getElementById('pCat').value,
                price: parseFloat(document.getElementById('pPrice').value),
                icon: iconValue,
                title_en: document.getElementById('pTitleEn').value.trim(),
                title_th: document.getElementById('pTitleTh').value.trim(),
                desc_en: document.getElementById('pDescEn').value.trim(),
                desc_th: document.getElementById('pDescTh').value.trim(),
                full_en: document.getElementById('pFullEn').value.trim(),
                full_th: document.getElementById('pFullTh').value.trim()
            };

            try {
                if (isEditing) {
                    await fetch('/api/products/' + newProd.id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProd)
                    });
                } else {
                    await fetch('/api/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProd)
                    });
                }
                modal.classList.remove('active');
                await fetchAdminProducts();
            } catch (err) {
                alert('Failed to save to MongoDB');
            }
        };

        const fileInput = document.getElementById('pImageFile');
        const urlInput = document.getElementById('pImage').value;
        const hiddenIcon = document.getElementById('pIcon').value;

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => saveProduct(ev.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        } else if (urlInput.trim() !== '') {
            saveProduct(urlInput.trim());
        } else {
            saveProduct(hiddenIcon || 'fas fa-box');
        }
    });

    async function deleteProduct(id) {
        const confirmMsg = typeof getMsg === 'function' ? getMsg('msg_delete_confirm') : "Are you sure you want to delete this product?";
        if (confirm(confirmMsg)) {
            try {
                await fetch('/api/products/' + id, { method: 'DELETE' });
                await fetchAdminProducts();
            } catch (err) {
                alert('Failed to delete from MongoDB');
            }
        }
    }

    // ---------- Order Management Functions ----------
    function renderOrders() {
        const orderTbody = document.getElementById('adminOrderList');
        if (!orderTbody) return;
        orderTbody.innerHTML = '';
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        fetch('/api/orders')
            .then(r => r.json())
            .then(orders => {
                orders.forEach(order => {
                    const tr = document.createElement('tr');
                    const isConfirmed = order.status === "Confirmed";
                    const statusText = isConfirmed
                        ? (typeof getMsg === 'function' ? getMsg('status_confirmed') : 'Confirmed')
                        : (typeof getMsg === 'function' ? getMsg('status_processing') : 'Processing');
                    const statusClass = isConfirmed ? 'status-confirmed' : 'status-processing';
                    const confirmBtnText = typeof getMsg === 'function' ? getMsg('btn_confirm_order') : 'Confirm';

                    const itemsSummary = Array.isArray(order.items)
                        ? order.items.map(i => `${i.title} (x${i.qty || 1})`).join(', ')
                        : '-';

                    tr.innerHTML = `
                        <td>
                            <strong>${order.id}</strong><br>
                            <small style="color:#a4b0be;"><i class="fas fa-user"></i> ${order.username || 'Guest'}</small><br>
                            <small style="color:#8c92a0;"><i class="fas fa-map-marker-alt"></i> ${order.address || '-'}</small>
                        </td>
                        <td>
                            ${new Date(order.date).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}<br>
                            <small style="color:#8c92a0; text-transform:uppercase;">Payment: ${order.payment || 'promptpay'}</small><br>
                            <small style="color:#d1d8e0; display:inline-block; max-width:280px;">${itemsSummary}</small>
                        </td>
                        <td><strong style="color:#2ecc71;">฿${Number(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            ${!isConfirmed
                                ? `<button class="action-btn confirm" data-id="${order.id}"><i class="fas fa-check"></i> ${confirmBtnText}</button>`
                                : '<span style="color:#2ecc71; font-size:0.9rem;"><i class="fas fa-check-double"></i> Confirmed</span>'}
                        </td>
                    `;
                    orderTbody.appendChild(tr);
                });

                orderTbody.querySelectorAll('.action-btn.confirm').forEach(btn => {
                    btn.addEventListener('click', e => confirmOrder(e.currentTarget.getAttribute('data-id')));
                });
            })
            .catch(err => console.error('Failed to load orders', err));
    }

    function confirmOrder(id) {
        fetch('/api/orders/' + id + '/confirm', { method: 'PATCH' })
            .then(r => r.json())
            .then(() => {
                renderOrders();
                const successMsg = typeof getMsg === 'function' ? getMsg('msg_order_confirmed') : 'Order confirmed!';
                if (typeof showToast === 'function') showToast(successMsg, false);
                else alert(successMsg);
            })
            .catch(err => console.error('Failed to confirm order', err));
    }

    window.addEventListener('languageChanged', () => {
        renderTable();
        renderOrders();
    });
});