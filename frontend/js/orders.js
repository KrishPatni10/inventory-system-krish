document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Load orders
    loadOrders();

    // Setup event listeners
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
    document.getElementById('dateFilter').addEventListener('change', handleFilter);
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        showMessage('Error loading orders', 'error');
        console.error('Error:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer.name}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${order.status.toLowerCase()}">
                    ${order.status}
                </span>
            </td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id})">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();
        
        const modalContent = document.getElementById('orderDetailsContent');
        modalContent.innerHTML = `
            <div class="order-details">
                <div class="order-info">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> #${order.id}</p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
                
                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${order.customer.name}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Address:</strong> ${order.customer.address}</p>
                </div>
                
                <div class="order-items">
                    <h3>Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        openModal('orderDetailsModal');
    } catch (error) {
        showMessage('Error loading order details', 'error');
        console.error('Error:', error);
    }
}

async function updateOrderStatus(orderId) {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatus = document.querySelector(`tr[data-order-id="${orderId}"] .status-badge`).textContent.toLowerCase();
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[currentIndex + 1] || statuses[0];

    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nextStatus })
        });

        if (response.ok) {
            loadOrders();
            showMessage('Order status updated successfully', 'success');
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        showMessage('Error updating order status', 'error');
        console.error('Error:', error);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#ordersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleFilter() {
    const status = document.getElementById('statusFilter').value;
    const date = document.getElementById('dateFilter').value;
    
    const rows = document.querySelectorAll('#ordersTableBody tr');
    
    rows.forEach(row => {
        const rowStatus = row.querySelector('.status-badge').textContent.toLowerCase();
        const rowDate = new Date(row.cells[2].textContent).toISOString().split('T')[0];
        
        const statusMatch = status === 'all' || rowStatus === status;
        const dateMatch = !date || rowDate === date;
        
        row.style.display = statusMatch && dateMatch ? '' : 'none';
    });
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility Functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 