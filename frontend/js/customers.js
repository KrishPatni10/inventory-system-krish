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

// Global variables
let currentCustomerId = null;
let isEditMode = false;

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

    if (customers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No customers found</td>
            </tr>
        `;
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${customer.orderCount || 0}</td>
            <td>$${(customer.totalSpent || 0).toFixed(2)}</td>
            <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="viewCustomerDetails(${customer.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-sm" onclick="editCustomer(${customer.id})" title="Edit Customer">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="showDeleteConfirmation(${customer.id})" title="Delete Customer">
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
        name: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim()
    };

    // Validation
    if (!customerData.name || !customerData.email) {
        showMessage('Name and email are required', 'error');
        return;
    }

    try {
        const url = isEditMode ? `/api/customers/${currentCustomerId}` : '/api/customers';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save customer');
        }

        const message = isEditMode ? 'Customer updated successfully' : 'Customer added successfully';
        showMessage(message, 'success');
        
        closeModal('addCustomerModal');
        resetForm();
        loadCustomers();
    } catch (error) {
        showMessage('Error saving customer: ' + error.message, 'error');
    }
}

// View customer details
async function viewCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer details');

        const customer = await response.json();
        currentCustomerId = customerId;
        
        const detailsContent = document.getElementById('customerDetailsContent');
        
        detailsContent.innerHTML = `
            <div class="customer-details">
                <div class="detail-group">
                    <label><i class="fas fa-user"></i> Name:</label>
                    <p>${customer.name}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-envelope"></i> Email:</label>
                    <p>${customer.email}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> Phone:</label>
                    <p>${customer.phone || 'Not provided'}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-map-marker-alt"></i> Address:</label>
                    <p>${customer.address || 'Not provided'}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-shopping-cart"></i> Total Orders:</label>
                    <p>${customer.orderCount || 0}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-dollar-sign"></i> Total Spent:</label>
                    <p>$${(customer.totalSpent || 0).toFixed(2)}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar"></i> Member Since:</label>
                    <p>${new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            ${customer.recentOrders && customer.recentOrders.length > 0 ? `
                <div class="recent-orders">
                    <h3><i class="fas fa-history"></i> Recent Orders</h3>
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
                                    <td>#${order.id}</td>
                                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>$${order.total_amount.toFixed(2)}</td>
                                    <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="no-orders">No orders found for this customer.</p>'}
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
        
        // Set edit mode
        isEditMode = true;
        currentCustomerId = customerId;
        
        // Update modal title and button
        document.getElementById('addCustomerTitle').textContent = 'Edit Customer';
        document.getElementById('submitBtn').textContent = 'Update Customer';
        
        // Populate form with customer data
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerAddress').value = customer.address || '';

        openModal('addCustomerModal');
    } catch (error) {
        showMessage('Error loading customer data: ' + error.message, 'error');
    }
}

// Edit customer from details modal
function editCustomerFromDetails() {
    closeModal('customerDetailsModal');
    editCustomer(currentCustomerId);
}

// Show delete confirmation
function showDeleteConfirmation(customerId) {
    currentCustomerId = customerId;
    openModal('deleteConfirmModal');
}

// Delete customer from details modal
function deleteCustomerFromDetails() {
    closeModal('customerDetailsModal');
    showDeleteConfirmation(currentCustomerId);
}

// Confirm delete customer
async function confirmDeleteCustomer() {
    try {
        const response = await fetch(`/api/customers/${currentCustomerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete customer');
        }

        showMessage('Customer deleted successfully', 'success');
        closeModal('deleteConfirmModal');
        loadCustomers();
    } catch (error) {
        showMessage('Error deleting customer: ' + error.message, 'error');
    }
}

// Reset form to add mode
function resetForm() {
    isEditMode = false;
    currentCustomerId = null;
    document.getElementById('addCustomerTitle').textContent = 'Add New Customer';
    document.getElementById('submitBtn').textContent = 'Add Customer';
    document.getElementById('addCustomerForm').reset();
}

// Open add customer modal
function openAddCustomerModal() {
    resetForm();
    openModal('addCustomerModal');
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
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form if closing add/edit modal
    if (modalId === 'addCustomerModal') {
        resetForm();
    }
}

// Show message
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Handle logout
function handleLogout() {
    sessionStorage.clear();
    window.location.href = '/login';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
} 