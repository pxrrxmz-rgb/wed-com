const fs = require('fs');
const path = require('path');
const base = 'C:/Users/MARCHlnwza/Desktop/wed com';

// 1. Insert Order Management section into admin.html before the Product Modal marker
let adminHtml = fs.readFileSync(path.join(base, 'admin.html'), 'utf-8');
const modalMarker = '<!-- Product Modal -->';
if (!adminHtml.includes(modalMarker)) {
  console.error('Modal marker not found in admin.html');
  process.exit(1);
}
const orderSection = `
    <!-- Orders Management -->
    <div class="admin-header" style="margin-top:40px;">
        <h2>Order Management</h2>
    </div>
    <table class="admin-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="adminOrderList">
            <!-- Injected via JS -->
        </tbody>
    </table>
`;
adminHtml = adminHtml.replace(modalMarker, orderSection + '\n' + modalMarker);
fs.writeFileSync(path.join(base, 'admin.html'), adminHtml);
console.log('admin.html updated with order section');

// 2. Update admin.js with order rendering and confirm logic
let adminJs = fs.readFileSync(path.join(base, 'admin.js'), 'utf-8');

// Insert helper functions before the final closing of the DOMContentLoaded listener
const closingIdx = adminJs.lastIndexOf('});');
if (closingIdx === -1) {
  console.error('Could not find closing of DOMContentLoaded');
  process.exit(1);
}

const helperCode = `
// ---------- Order Management Functions ----------
function renderOrders() {
    const tbody = document.getElementById('adminOrderList');
    if (!tbody) return;
    tbody.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + order.id + '</td>' +
            '<td>' + new Date(order.date).toLocaleString() + '</td>' +
            '<td>$' + order.total.toFixed(2) + '</td>' +
            '<td>' + order.status + '</td>' +
            '<td>' + (order.status !== "Confirmed" ? '<button class="action-btn confirm" data-id="' + order.id + '">Confirm</button>' : '') + '</td>';
        tbody.appendChild(tr);
    });
    // Bind confirm buttons
    document.querySelectorAll('.action-btn.confirm').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.getAttribute('data-id');
            confirmOrder(id);
        });
    });
}

function confirmOrder(id) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
        orders[idx].status = 'Confirmed';
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        if (typeof showToast === 'function') showToast('Order confirmed!', false);
        else alert('Order confirmed!');
    }
}
// ----------------------------------------------
`;

// Insert helperCode before the final closing '});'
adminJs = adminJs.slice(0, closingIdx) + helperCode + '\n' + adminJs.slice(closingIdx);

// Ensure that after any renderTable() call we also call renderOrders()
adminJs = adminJs.replace(/renderTable\(\);/g, 'renderTable(); renderOrders();');

fs.writeFileSync(path.join(base, 'admin.js'), adminJs);
console.log('admin.js updated with order functions and calls');
