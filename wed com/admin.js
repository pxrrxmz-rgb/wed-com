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
        fetchAdminProducts(); renderOrders();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPass').value;
        if (pass === adminPasscode) {
            sessionStorage.setItem('isAdminLogged', 'true');
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            fetchAdminProducts(); renderOrders();
        } else {
            alert("Incorrect passcode!");
        }
    });
    
    const tbody = document.getElementById('adminProductList');
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const addBtn = document.getElementById('addBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    

    async function fetchAdminProducts() {
        try {
            const res = await fetch('/api/products');
            products = await res.json();
            renderTable();
        } catch (err) {
            console.error(err);
            products = getProducts();
            renderTable();
        }
    }

    function renderTable() {
        tbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            let iconHtml = '';
            if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
                iconHtml = `<img src="${p.icon}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">`;
            } else {
                iconHtml = `<i class="${p.icon || 'fas fa-box'}" style="font-size:1.5rem; color:#c02020;"></i>`;
            }
            tr.innerHTML = `
                <td>${iconHtml}</td>
                <td><strong>${p.title_en}</strong><br><small style="color:#8c92a0;">${p.title_th}</small></td>
                <td><span style="background:rgba(255,255,255,0.1); padding: 4px 10px; border-radius:10px; font-size:0.8rem; text-transform:uppercase;">${p.category}</span></td>
                <td>$${p.price.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" data-id="${p.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Bind Actions
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteProduct(e.currentTarget.getAttribute('data-id')));
        });
    }

    // Modal Logic
    addBtn.addEventListener('click', () => {
        isEditing = false;
        form.reset();
        document.getElementById('pId').value = '';
        document.getElementById('modalTitle').textContent = 'Add New Product';
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    function openModal(id) {
        isEditing = true;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        const p = products.find(x => x.id === id);
        
        document.getElementById('pId').value = p.id;
        document.getElementById('pCat').value = p.category;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pIcon').value = p.icon;
        document.getElementById('pImage').value = p.icon;
        document.getElementById('pImageFile').value = '';
        document.getElementById('pTitleEn').value = p.title_en;
        document.getElementById('pTitleTh').value = p.title_th;
        document.getElementById('pDescEn').value = p.desc_en;
        document.getElementById('pDescTh').value = p.desc_th;
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
        if(confirm("Are you sure you want to delete this product?")) {
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
    // Fetch orders from backend API
    fetch('/api/orders')
        .then(r => r.json())
        .then(orders => {
            orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + order.id + '</td>' +
                    '<td>' + new Date(order.date).toLocaleString() + '</td>' +
                    '<td>$' + (order.total || 0).toFixed(2) + '</td>' +
                    '<td>' + order.status + '</td>' +
                    '<td>' + (order.status !== "Confirmed" ? '<button class="action-btn confirm" data-id="' + order.id + '">Confirm</button>' : '') + '</td>';
                tbody.appendChild(tr);
            });
            // Bind confirm buttons after rendering
            document.querySelectorAll('.action-btn.confirm').forEach(btn => {
                btn.addEventListener('click', e => {
                    const id = e.currentTarget.getAttribute('data-id');
                    confirmOrder(id);
                });
            });
        })
        .catch(err => {
            console.error('Failed to load orders via API, trying localStorage', err);
            // Fallback for frontend-only
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + order.id + '</td>' +
                    '<td>' + new Date(order.date).toLocaleString() + '</td>' +
                    '<td>$' + (order.total || 0).toFixed(2) + '</td>' +
                    '<td>' + order.status + '</td>' +
                    '<td>' + (order.status !== "Confirmed" ? '<button class="action-btn confirm" data-id="' + order.id + '">Confirm</button>' : '') + '</td>';
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.action-btn.confirm').forEach(btn => {
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
        .then(() => renderOrders())
        .catch(err => {
            console.error('API failed, falling back to localStorage', err);
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const idx = orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                orders[idx].status = 'Confirmed';
                localStorage.setItem('orders', JSON.stringify(orders));
                renderOrders();
                if (typeof showToast === 'function') showToast('Order confirmed!', false);
                else alert('Order confirmed!');
            }
        });
}
// ----------------------------------------------

});

