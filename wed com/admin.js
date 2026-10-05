document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let isEditing = false;

    // Admin Auth Logic
    const adminPasscode = "admin1234"; // The secret passcode
    const loginContainer = document.getElementById('adminLoginContainer');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('adminLoginForm');

    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
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

    // Tab switcher between Products and Orders
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

        products.forEach(p => {
            const tr = document.createElement('tr');
            let iconHtml = '';
            if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
                iconHtml = `<img src="${p.icon}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">`;
            } else {
                iconHtml = `<i class="${p.icon || 'fas fa-box'}" style="font-size:1.6rem; color:#c02020;"></i>`;
            }

            const mainTitle = (lang === 'th' && p.title_th) ? p.title_th : (p.title_en || 'Product');
            const subTitle = (lang === 'th') ? (p.title_en || '') : (p.title_th || '');
            const categoryText = (typeof getMsg === 'function') ? getMsg('cat_' + p.category) : p.category;

            tr.innerHTML = `
                <td>${iconHtml}</td>
                <td><strong>${mainTitle}</strong><br><small style="color:#8c92a0;">${subTitle}</small></td>
                <td><span style="background:rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius:12px; font-size:0.8rem; text-transform:uppercase;">${categoryText}</span></td>
                <td><strong style="color:#2ecc71;">฿${(p.price || 0).toFixed(2)}</strong></td>
                <td>
                    <button class="action-btn edit" data-id="${p.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Bind Actions
        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.currentTarget.getAttribute('data-id')));
        });
        tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteProduct(e.currentTarget.getAttribute('data-id')));
        });
    }

    // Modal Logic
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
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    function openModal(id) {
        isEditing = true;
        document.getElementById('modalTitle').textContent = typeof getMsg === 'function' ? getMsg('modal_edit_title') : 'Edit Product';
        const p = products.find(x => x.id === id);
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
            const newProd = {
                id: isEditing ? document.getElementById('pId').value : 'p' + Date.now(),
                category: document.getElementById('pCat').value,
                price: parseFloat(document.getElementById('pPrice').value),
                icon: iconValue,
                title_en: document.getElementById('pTitleEn').value,
                title_th: document.getElementById('pTitleTh').value,
                desc_en: document.getElementById('pDescEn').value,
                desc_th: document.getElementById('pDescTh').value,
                full_en: document.getElementById('pFullEn').value,
                full_th: document.getElementById('pFullTh').value
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
            reader.onload = (e) => {
                saveProduct(e.target.result);
            };
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
        const tbody = document.getElementById('adminOrderList');
        if (!tbody) return;
        tbody.innerHTML = '';
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        // Fetch orders from backend API
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

                    tr.innerHTML = `
                        <td><strong>${order.id}</strong></td>
                        <td>${new Date(order.date).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}</td>
                        <td><strong style="color:#2ecc71;">฿${(order.total || 0).toFixed(2)}</strong></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${!isConfirmed ? `<button class="action-btn confirm" data-id="${order.id}"><i class="fas fa-check"></i> ${confirmBtnText}</button>` : '<span style="color:#2ecc71; font-size:0.85rem;"><i class="fas fa-check-double"></i></span>'}</td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Bind confirm buttons after rendering
                tbody.querySelectorAll('.action-btn.confirm').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = e.currentTarget.getAttribute('data-id');
                        confirmOrder(id);
                    });
                });
            })
            .catch(err => {
                console.error('Failed to load orders via API, trying localStorage', err);
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                orders.forEach(order => {
                    const tr = document.createElement('tr');
                    const isConfirmed = order.status === "Confirmed";
                    const statusText = isConfirmed 
                        ? (typeof getMsg === 'function' ? getMsg('status_confirmed') : 'Confirmed')
                        : (typeof getMsg === 'function' ? getMsg('status_processing') : 'Processing');
                    const statusClass = isConfirmed ? 'status-confirmed' : 'status-processing';
                    const confirmBtnText = typeof getMsg === 'function' ? getMsg('btn_confirm_order') : 'Confirm';

                    tr.innerHTML = `
                        <td><strong>${order.id}</strong></td>
                        <td>${new Date(order.date).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}</td>
                        <td><strong style="color:#2ecc71;">฿${(order.total || 0).toFixed(2)}</strong></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${!isConfirmed ? `<button class="action-btn confirm" data-id="${order.id}"><i class="fas fa-check"></i> ${confirmBtnText}</button>` : '<span style="color:#2ecc71; font-size:0.85rem;"><i class="fas fa-check-double"></i></span>'}</td>
                    `;
                    tbody.appendChild(tr);
                });
                tbody.querySelectorAll('.action-btn.confirm').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = e.currentTarget.getAttribute('data-id');
                        confirmOrder(id);
                    });
                });
            });
    }

    function confirmOrder(id) {
        fetch('/api/orders/' + id + '/confirm', {
            method: 'PATCH'
        })
            .then(r => r.json())
            .then(() => {
                renderOrders();
                const successMsg = typeof getMsg === 'function' ? getMsg('msg_order_confirmed') : 'Order confirmed!';
                if (typeof showToast === 'function') showToast(successMsg, false);
                else alert(successMsg);
            })
            .catch(err => {
                console.error('API failed, falling back to localStorage', err);
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                const idx = orders.findIndex(o => o.id === id);
                if (idx !== -1) {
                    orders[idx].status = 'Confirmed';
                    localStorage.setItem('orders', JSON.stringify(orders));
                    renderOrders();
                    const successMsg = typeof getMsg === 'function' ? getMsg('msg_order_confirmed') : 'Order confirmed!';
                    if (typeof showToast === 'function') showToast(successMsg, false);
                    else alert(successMsg);
                }
            });
    }

    // Listen to language changes to update live table content
    window.addEventListener('languageChanged', () => {
        renderTable();
        renderOrders();
        const mTitle = document.getElementById('modalTitle');
        if (mTitle) {
            mTitle.textContent = isEditing ? 
                (typeof getMsg === 'function' ? getMsg('modal_edit_title') : 'Edit Product') : 
                (typeof getMsg === 'function' ? getMsg('modal_add_title') : 'Add New Product');
        }
    });

});
