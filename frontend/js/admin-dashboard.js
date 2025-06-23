document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadDashboardStats();
    loadProducts();
    loadCustomers();
    loadOrders();

    // Add event listeners
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);

    // Add navigation event listeners
    const navLinks = document.querySelectorAll('.nav-links li[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Add search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Initialize reports section
    initializeReports();
});

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show the selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load specific data for the section
        switch(sectionName) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'products':
                loadProducts();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'reports':
                loadReports();
                break;
        }
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const currentSection = document.querySelector('.section.active');
    
    if (!currentSection) return;
    
    const sectionId = currentSection.id;
    
    switch(sectionId) {
        case 'products':
            filterProducts(searchTerm);
            break;
        case 'customers':
            filterCustomers(searchTerm);
            break;
        case 'orders':
            filterOrders(searchTerm);
            break;
    }
}

async function loadDashboardStats() {
    try {
        const stats = await api.getDashboardStats();
        
        // Update dashboard stats
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;
        document.getElementById('totalRevenue').textContent = `$${(stats.totalValue || 0).toFixed(2)}`;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showMessage('Error loading dashboard stats', 'error');
    }
}

async function loadProducts() {
    try {
        const products = await api.getProducts();
        const productsContainer = document.getElementById('productsContainer');
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-data">No products found. Add your first product!</p>';
            return;
        }
        
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                    <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>Quantity:</strong> <span class="quantity ${product.quantity < 10 ? 'low-stock' : ''}">${product.quantity}</span></p>
                    <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                    <p><strong>Supplier:</strong> ${product.supplier || 'N/A'}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error loading products', 'error');
    }
}

function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productSku = card.querySelector('p').textContent.toLowerCase();
        const productBrand = card.querySelectorAll('p')[1].textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productSku.includes(searchTerm) || productBrand.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function loadCustomers() {
    try {
        const customers = await api.getCustomers();
        const customersContainer = document.getElementById('customersContainer');
        
        if (customers.length === 0) {
            customersContainer.innerHTML = '<p class="no-data">No customers found. Add your first customer!</p>';
            return;
        }
        
        customersContainer.innerHTML = customers.map(customer => `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-info">
                    <h3>${customer.name}</h3>
                    <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                    <p><strong>Orders:</strong> ${customer.orderCount || 0}</p>
                    <p><strong>Total Spent:</strong> $${(customer.totalSpent || 0).toFixed(2)}</p>
                    <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
                </div>
                <div class="customer-actions">
                    <button class="btn btn-secondary" onclick="viewCustomerDetails(${customer.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary" onclick="editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
        showMessage('Error loading customers', 'error');
    }
}

function filterCustomers(searchTerm) {
    const customerCards = document.querySelectorAll('.customer-card');
    customerCards.forEach(card => {
        const customerName = card.querySelector('h3').textContent.toLowerCase();
        const customerEmail = card.querySelectorAll('p')[0].textContent.toLowerCase();
        
        if (customerName.includes(searchTerm) || customerEmail.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function loadOrders() {
    try {
        const orders = await api.getOrders();
        const ordersContainer = document.getElementById('ordersContainer');
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-data">No orders found.</p>';
            return;
        }
        
        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p><strong>Customer ID:</strong> ${order.customerId}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Items:</strong> ${order.items.length} item(s)</p>
                </div>
                <div class="order-actions">
                    <button class="btn btn-secondary" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i> Update
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Error loading orders', 'error');
    }
}

function filterOrders(searchTerm) {
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        const orderId = card.querySelector('h3').textContent.toLowerCase();
        const orderStatus = card.querySelector('.status').textContent.toLowerCase();
        
        if (orderId.includes(searchTerm) || orderStatus.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function initializeReports() {
    // Add Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            loadReports();
        };
        document.head.appendChild(script);
    } else {
        loadReports();
    }
}

async function loadReports() {
    try {
        const stats = await api.getDashboardStats();
        const products = await api.getProducts();
        const orders = await api.getOrders();
        const customers = await api.getCustomers();
        
        // Update inventory stats
        updateInventoryStats(products);
        
        // Update revenue stats
        updateRevenueStats(orders);
        
        // Create all charts
        createSalesChart(orders);
        createTopProductsChart(products, orders);
        createCategoryChart(products);
        createCustomerChart(customers);
        createInventoryChart(products);
        createRevenueChart(orders);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showMessage('Error loading reports', 'error');
    }
}

function updateInventoryStats(products) {
    const lowStockCount = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    document.getElementById('lowStockCount').textContent = lowStockCount;
    document.getElementById('outOfStockCount').textContent = outOfStockCount;
    document.getElementById('inventoryValue').textContent = `$${inventoryValue.toFixed(2)}`;
}

function updateRevenueStats(orders) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('avgOrderValue').textContent = `$${avgOrderValue.toFixed(2)}`;
    document.getElementById('ordersCount').textContent = orders.length;
}

function createSalesChart(orders) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // Group orders by month
    const monthlyData = {};
    orders.forEach(order => {
        const date = new Date(order.date);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + order.total;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Monthly Sales',
                data: Object.values(monthlyData),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function createTopProductsChart(products, orders) {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;
    
    // Calculate product sales from orders
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + (item.price * item.quantity);
        });
    });
    
    // Sort by sales and get top 5
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topProducts.map(([name]) => name),
            datasets: [{
                data: topProducts.map(([,sales]) => sales),
                backgroundColor: [
                    '#4f46e5',
                    '#818cf8',
                    '#22c55e',
                    '#eab308',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function createCategoryChart(products) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Create category distribution chart
    const categoryData = {};
    products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                label: 'Products per Category',
                data: Object.values(categoryData),
                backgroundColor: '#4f46e5',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createCustomerChart(customers) {
    const ctx = document.getElementById('customerChart');
    if (!ctx) return;
    
    // Customer spending analysis
    const customerSpending = customers.map(c => c.totalSpent || 0);
    const labels = customers.map(c => c.name);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Spent',
                data: customerSpending,
                backgroundColor: '#22c55e',
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function createInventoryChart(products) {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;
    
    const inStock = products.filter(p => p.quantity > 10).length;
    const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [inStock, lowStock, outOfStock],
                backgroundColor: [
                    '#22c55e',
                    '#eab308',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function createRevenueChart(orders) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Revenue by order status
    const statusRevenue = {};
    orders.forEach(order => {
        statusRevenue[order.status] = (statusRevenue[order.status] || 0) + order.total;
    });
    
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(statusRevenue),
            datasets: [{
                data: Object.values(statusRevenue),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function updateReports() {
    const period = document.getElementById('reportPeriod').value;
    // In a real app, this would filter data based on the selected period
    loadReports();
}

function exportReports() {
    // Create a simple export functionality
    const exportData = {
        timestamp: new Date().toISOString(),
        reports: {
            sales: 'Sales data would be exported here',
            inventory: 'Inventory data would be exported here',
            customers: 'Customer data would be exported here'
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Reports exported successfully!', 'success');
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value,
        brand: document.getElementById('productBrand').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        supplier: document.getElementById('productSupplier').value,
        category: document.getElementById('productCategory').value
    };

    try {
        await api.createProduct(productData);
        showMessage('Product added successfully', 'success');
        closeModal('addProductModal');
        loadProducts();
        loadDashboardStats();
        event.target.reset();
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Error adding product', 'error');
    }
}

async function handleAddCustomer(event) {
    event.preventDefault();
    
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value
    };

    try {
        await api.createCustomer(customerData);
        showMessage('Customer added successfully', 'success');
        closeModal('addCustomerModal');
        loadCustomers();
        loadDashboardStats();
        event.target.reset();
    } catch (error) {
        console.error('Error adding customer:', error);
        showMessage('Error adding customer', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await api.deleteProduct(productId);
        showMessage('Product deleted successfully', 'success');
        loadProducts();
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product', 'error');
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        await api.deleteCustomer(customerId);
        showMessage('Customer deleted successfully', 'success');
        loadCustomers();
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting customer:', error);
        showMessage('Error deleting customer', 'error');
    }
}

function handleLogout() {
    api.logout();
}

function showMessage(message, type) {
    // Create a simple message display
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Additional utility functions
function editProduct(productId) {
    showMessage('Edit product functionality coming soon!', 'success');
}

function viewCustomerDetails(customerId) {
    showMessage('Customer details view coming soon!', 'success');
}

function editCustomer(customerId) {
    showMessage('Edit customer functionality coming soon!', 'success');
}

function viewOrderDetails(orderId) {
    showMessage('Order details view coming soon!', 'success');
}

function updateOrderStatus(orderId) {
    showMessage('Update order status functionality coming soon!', 'success');
} 