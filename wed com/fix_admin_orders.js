const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf-8');
// Insert Orders Section before Product Modal comment
const marker = '<!-- Product Modal -->';
if (!html.includes(marker)) {
  console.error('Marker not found in admin.html');
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
html = html.replace(marker, orderSection + '\n' + marker);
fs.writeFileSync('admin.html', html);
console.log('admin.html updated with order section');

let js = fs.readFileSync('admin.js', 'utf-8');
// Append renderOrders function after renderTable definition
const renderTableEnd = 'function renderTable() {';
const idx = js.indexOf(renderTableEnd);
if (idx === -1) { console.error('renderTable not found'); process.exit(1); }
// Find the closing brace of renderTable (first '}' after its start)
let braceCount = 0;
let pos = idx;
for (let i = 0; i < js.length; i++) {
  const ch = js[i];
  if (ch === '{') braceCount++;
  if (ch === '}') braceCount--;
  if (braceCount === 0 && i > idx) { pos = i; break; }
}
// Insert after the closing brace of renderTable
const insertionPoint = pos + 1;
const renderOrdersFunc = `
// Render Orders Table
function renderOrders() {
    const tbody = document.getElementById('adminOrderList');
    tbody.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${new Date(order.date).toLocaleString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${order.status}</td>
            <td>${order.status !== 'Confirmed' ? '<button class="action-btn confirm" data-id="' + order.id + '">Confirm</button>' : ''}</td>
        `;
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
`;
js = js.slice(0, insertionPoint) + renderOrdersFunc + js.slice(insertionPoint);
// After login logic where renderTable() is called, also call renderOrders()
js = js.replace('renderTable();', 'renderTable(); renderOrders();');
fs.writeFileSync('admin.js', js);
console.log('admin.js updated with order rendering and confirm logic');
