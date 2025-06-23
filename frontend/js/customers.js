document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Load customers
    loadCustomers();

    // Add event listeners
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('logout').addEventListener('click', handleLogout);
});

// Load customers from API
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        showMessage('Error loading customers: ' + error.message, 'error');
    }
}

// Display customers in table
function displayCustomers(customers) {
    const tableBody = document.getElementById('customersTableBody');
    tableBody.innerHTML = '';

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.orderCount}</td>
            <td>$${customer.totalSpent.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewCustomerDetails(${customer.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary" onclick="editCustomer(${customer.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle add customer form submission
async function handleAddCustomer(event) {
    event.preventDefault();

    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value
    };

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) throw new Error('Failed to add customer');

        showMessage('Customer added successfully', 'success');
        closeModal('addCustomerModal');
        loadCustomers();
        event.target.reset();
    } catch (error) {
        showMessage('Error adding customer: ' + error.message, 'error');
    }
}

// View customer details
async function viewCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer details');

        const customer = await response.json();
        const detailsContent = document.getElementById('customerDetailsContent');
        
        detailsContent.innerHTML = `
            <div class="customer-details">
                <div class="detail-group">
                    <label>Name:</label>
                    <p>${customer.name}</p>
                </div>
                <div class="detail-group">
                    <label>Email:</label>
                    <p>${customer.email}</p>
                </div>
                <div class="detail-group">
                    <label>Phone:</label>
                    <p>${customer.phone}</p>
                </div>
                <div class="detail-group">
                    <label>Address:</label>
                    <p>${customer.address}</p>
                </div>
                <div class="detail-group">
                    <label>Total Orders:</label>
                    <p>${customer.orderCount}</p>
                </div>
                <div class="detail-group">
                    <label>Total Spent:</label>
                    <p>$${customer.totalSpent.toFixed(2)}</p>
                </div>
            </div>
            <div class="recent-orders">
                <h3>Recent Orders</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customer.recentOrders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${new Date(order.date).toLocaleDateString()}</td>
                                <td>$${order.total.toFixed(2)}</td>
                                <td>${order.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        openModal('customerDetailsModal');
    } catch (error) {
        showMessage('Error loading customer details: ' + error.message, 'error');
    }
}

// Edit customer
async function editCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer data');

        const customer = await response.json();
        // Populate form with customer data
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerAddress').value = customer.address;

        // Update form submission handler for edit
        const form = document.getElementById('addCustomerForm');
        form.onsubmit = async (event) => {
            event.preventDefault();
            await handleUpdateCustomer(customerId, event);
        };

        openModal('addCustomerModal');
    } catch (error) {
        showMessage('Error loading customer data: ' + error.message, 'error');
    }
}

// Handle customer update
async function handleUpdateCustomer(customerId, event) {
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value
    };

    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) throw new Error('Failed to update customer');

        showMessage('Customer updated successfully', 'success');
        closeModal('addCustomerModal');
        loadCustomers();
        event.target.reset();
    } catch (error) {
        showMessage('Error updating customer: ' + error.message, 'error');
    }
}

// Delete customer
async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete customer');

        showMessage('Customer deleted successfully', 'success');
        loadCustomers();
    } catch (error) {
        showMessage('Error deleting customer: ' + error.message, 'error');
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#customersTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
} 