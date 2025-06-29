document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js is available on page load');
    } else {
        console.log('Chart.js not available on page load, will check later');
    }
    
    // Load initial data
    loadDashboardStats();
    loadProducts();
    loadCustomers();
    loadOrders();
    loadReturns();

    // Add event listeners
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);
    document.getElementById('editCustomerForm').addEventListener('submit', handleEditCustomer);

    // Add navigation event listeners
    const navLinks = document.querySelectorAll('.nav .nav-item[data-section]');
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
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Initialize reports section
    initializeReports();
});

function showSection(sectionName) {
    // Clean up charts if switching away from reports
    const currentActiveSection = document.querySelector('.section.active');
    if (currentActiveSection && currentActiveSection.id === 'reports' && sectionName !== 'reports') {
        cleanupCharts();
    }
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Add active class to selected nav item
    const selectedNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (selectedNavItem) {
        selectedNavItem.classList.add('active');
    }
    
    // Load data for the selected section
    switch (sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'returns':
            loadReturns();
            break;
        case 'reports':
            // Initialize reports when section is shown
            initializeReports();
            loadReports();
            break;
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
        document.getElementById('totalRevenue').textContent = `₹${Math.round(stats.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
        document.getElementById('completedOrders').textContent = stats.completedOrders || 0;
        document.getElementById('activeCustomers').textContent = stats.activeCustomers || 0;
        document.getElementById('recentOrders').textContent = stats.recentOrders || 0;
        document.getElementById('lowStock').textContent = stats.lowStock || 0;
        document.getElementById('inventoryValue').textContent = `₹${Math.round(stats.totalValue || 0).toLocaleString()}`;
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
                <img src="${product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                    <p><strong>Price:</strong> ₹${product.price.toLocaleString()}</p>
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
    // Initialize chart variables
    window.salesChart = null;
    window.topProductsChart = null;
    window.categoryChart = null;
    window.customerChart = null;
    window.inventoryChart = null;
    window.revenueChart = null;
    
    console.log('Reports initialized');
}

async function loadReports() {
    try {
        console.log('Loading reports...');
        
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded, waiting...');
            setTimeout(loadReports, 100);
            return;
        }
        
        console.log('Chart.js is available, proceeding with data loading...');
        
        const stats = await api.getDashboardStats();
        const products = await api.getProducts();
        const orders = await api.getOrders();
        const customers = await api.getCustomers();
        
        console.log('Data loaded:', { 
            products: products.length, 
            orders: orders.length, 
            customers: customers.length,
            stats: stats 
        });
        
        // Update inventory stats
        updateInventoryStats(products);
        
        // Update revenue stats
        updateRevenueStats(orders);
        
        // Create all charts with delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Creating charts...');
            try {
                createSalesChart(orders);
                createTopProductsChart(products, orders);
                createCategoryChart(products);
                createCustomerChart(customers);
                createInventoryChart(products);
                createRevenueChart(orders);
                console.log('All charts created successfully');
            } catch (error) {
                console.error('Error creating charts:', error);
            }
        }, 200);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showMessage('Error loading reports', 'error');
    }
}

function updateInventoryStats(products) {
    const lowStockCount = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const lowStockElement = document.getElementById('lowStockCount');
    const outOfStockElement = document.getElementById('outOfStockCount');
    const inventoryValueElement = document.getElementById('inventoryValue');
    
    if (lowStockElement) lowStockElement.textContent = lowStockCount;
    if (outOfStockElement) outOfStockElement.textContent = outOfStockCount;
    if (inventoryValueElement) inventoryValueElement.textContent = `₹${inventoryValue.toFixed(2)}`;
}

function updateRevenueStats(orders) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const totalRevenueElement = document.getElementById('totalRevenue');
    if (totalRevenueElement) totalRevenueElement.textContent = `₹${totalRevenue.toFixed(2)}`;
}

function createSalesChart(orders) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) {
        console.log('Sales chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.salesChart && typeof window.salesChart.destroy === 'function') {
        try {
            window.salesChart.destroy();
        } catch (error) {
            console.log('Error destroying sales chart:', error);
        }
    }
    
    // Create sample data if no orders
    let chartData = [];
    let chartLabels = [];
    
    if (orders.length > 0) {
        // Group orders by month
        const monthlyData = {};
        orders.forEach(order => {
            const date = new Date(order.date);
            const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyData[month] = (monthlyData[month] || 0) + order.total;
        });
        
        chartLabels = Object.keys(monthlyData);
        chartData = Object.values(monthlyData);
    } else {
        // Sample data for demonstration
        chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        chartData = [1200, 1900, 3000, 5000, 2000, 3000];
    }
    
    try {
        window.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Monthly Sales',
                    data: chartData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating sales chart:', error);
    }
}

function createTopProductsChart(products, orders) {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) {
        console.log('Top products chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.topProductsChart && typeof window.topProductsChart.destroy === 'function') {
        try {
            window.topProductsChart.destroy();
        } catch (error) {
            console.log('Error destroying top products chart:', error);
        }
    }
    
    // Create sample data if no orders
    let chartLabels = [];
    let chartData = [];
    
    if (orders.length > 0 && orders[0].items) {
        // Calculate product sales from orders
        const productSales = {};
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + (item.price * item.quantity);
                });
            }
        });
        
        // Sort by sales and get top 5
        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        chartLabels = topProducts.map(([name]) => name);
        chartData = topProducts.map(([,sales]) => sales);
    } else {
        // Sample data for demonstration
        chartLabels = ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Mouse'];
        chartData = [5000, 3000, 2000, 1500, 800];
    }
    
    try {
        window.topProductsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
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
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating top products chart:', error);
    }
}

function createCategoryChart(products) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) {
        console.log('Category chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
        try {
            window.categoryChart.destroy();
        } catch (error) {
            console.log('Error destroying category chart:', error);
        }
    }
    
    // Create category distribution chart
    const categoryData = {};
    if (products.length > 0) {
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            categoryData[category] = (categoryData[category] || 0) + 1;
        });
    } else {
        // Sample data for demonstration
        categoryData['Electronics'] = 5;
        categoryData['Clothing'] = 3;
        categoryData['Books'] = 2;
        categoryData['Home'] = 4;
    }
    
    try {
        window.categoryChart = new Chart(ctx, {
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
                maintainAspectRatio: false,
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
    } catch (error) {
        console.error('Error creating category chart:', error);
    }
}

function createCustomerChart(customers) {
    const ctx = document.getElementById('customerChart');
    if (!ctx) {
        console.log('Customer chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.customerChart && typeof window.customerChart.destroy === 'function') {
        try {
            window.customerChart.destroy();
        } catch (error) {
            console.log('Error destroying customer chart:', error);
        }
    }
    
    // Customer spending analysis
    let chartLabels = [];
    let chartData = [];
    
    if (customers.length > 0) {
        chartLabels = customers.map(c => c.name);
        chartData = customers.map(c => c.totalSpent || 0);
    } else {
        // Sample data for demonstration
        chartLabels = ['Customer A', 'Customer B', 'Customer C', 'Customer D'];
        chartData = [500, 300, 800, 200];
    }
    
    try {
        window.customerChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: [
                        '#4f46e5',
                        '#818cf8',
                        '#22c55e',
                        '#eab308'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating customer chart:', error);
    }
}

function createInventoryChart(products) {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) {
        console.log('Inventory chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.inventoryChart && typeof window.inventoryChart.destroy === 'function') {
        try {
            window.inventoryChart.destroy();
        } catch (error) {
            console.log('Error destroying inventory chart:', error);
        }
    }
    
    // Inventory status chart
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    
    if (products.length > 0) {
        inStock = products.filter(p => p.quantity >= 10).length;
        lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
        outOfStock = products.filter(p => p.quantity === 0).length;
    } else {
        // Sample data for demonstration
        inStock = 8;
        lowStock = 3;
        outOfStock = 2;
    }
    
    try {
        window.inventoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                datasets: [{
                    label: 'Inventory Status',
                    data: [inStock, lowStock, outOfStock],
                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
    } catch (error) {
        console.error('Error creating inventory chart:', error);
    }
}

function createRevenueChart(orders) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) {
        console.log('Revenue chart canvas not found');
        return;
    }
    
    // Safely destroy existing chart if it exists and is a valid Chart instance
    if (window.revenueChart && typeof window.revenueChart.destroy === 'function') {
        try {
            window.revenueChart.destroy();
        } catch (error) {
            console.log('Error destroying revenue chart:', error);
        }
    }
    
    // Revenue by status
    const statusRevenue = {};
    if (orders.length > 0) {
        orders.forEach(order => {
            const status = order.status || 'Pending';
            statusRevenue[status] = (statusRevenue[status] || 0) + order.total;
        });
    } else {
        // Sample data for demonstration
        statusRevenue['Completed'] = 5000;
        statusRevenue['Pending'] = 2000;
        statusRevenue['Cancelled'] = 500;
    }
    
    try {
        window.revenueChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusRevenue),
                datasets: [{
                    data: Object.values(statusRevenue),
                    backgroundColor: [
                        '#22c55e',
                        '#eab308',
                        '#ef4444',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating revenue chart:', error);
    }
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

async function viewCustomerDetails(customerId) {
    try {
        const customers = await api.getCustomers();
        const customer = customers.find(c => c.id === customerId);
        
        if (!customer) {
            showMessage('Customer not found', 'error');
            return;
        }

        // Populate customer details
        const detailsContent = document.getElementById('customerDetailsContent');
        detailsContent.innerHTML = `
            <div class="detail-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <p>${customer.name}</p>
            </div>
            <div class="detail-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <p>${customer.email || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <label><i class="fas fa-phone"></i> Phone</label>
                <p>${customer.phone || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <label><i class="fas fa-map-marker-alt"></i> Address</label>
                <p>${customer.address || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <label><i class="fas fa-shopping-cart"></i> Total Orders</label>
                <p>${customer.orderCount || 0}</p>
            </div>
            <div class="detail-group">
                <label><i class="fas fa-dollar-sign"></i> Total Spent</label>
                <p>₹${(customer.totalSpent || 0).toFixed(2)}</p>
            </div>
        `;

        // Load customer orders
        const orders = await api.getOrders();
        const customerOrders = orders.filter(order => order.customerId === customerId);
        
        const ordersList = document.getElementById('customerOrdersList');
        if (customerOrders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders found for this customer.</p>';
        } else {
            ordersList.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerOrders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${new Date(order.date).toLocaleDateString()}</td>
                                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                                <td>₹${order.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Store current customer ID for editing
        document.getElementById('editCustomerModal').setAttribute('data-customer-id', customerId);
        
        openModal('viewCustomerModal');
    } catch (error) {
        console.error('Error loading customer details:', error);
        showMessage('Error loading customer details', 'error');
    }
}

async function editCustomer(customerId) {
    try {
        const customers = await api.getCustomers();
        const customer = customers.find(c => c.id === customerId);
        
        if (!customer) {
            showMessage('Customer not found', 'error');
            return;
        }

        // Populate edit form
        document.getElementById('editCustomerId').value = customer.id;
        document.getElementById('editCustomerName').value = customer.name;
        document.getElementById('editCustomerEmail').value = customer.email || '';
        document.getElementById('editCustomerPhone').value = customer.phone || '';
        document.getElementById('editCustomerAddress').value = customer.address || '';
        
        openModal('editCustomerModal');
    } catch (error) {
        console.error('Error loading customer for editing:', error);
        showMessage('Error loading customer data', 'error');
    }
}

function editCurrentCustomer() {
    const customerId = document.getElementById('editCustomerModal').getAttribute('data-customer-id');
    if (customerId) {
        closeModal('viewCustomerModal');
        editCustomer(parseInt(customerId));
    }
}

async function handleEditCustomer(event) {
    event.preventDefault();
    
    const customerId = parseInt(document.getElementById('editCustomerId').value);
    const customerData = {
        name: document.getElementById('editCustomerName').value,
        email: document.getElementById('editCustomerEmail').value,
        phone: document.getElementById('editCustomerPhone').value,
        address: document.getElementById('editCustomerAddress').value
    };

    try {
        await api.updateCustomer(customerId, customerData);
        showMessage('Customer updated successfully', 'success');
        closeModal('editCustomerModal');
        loadCustomers();
        event.target.reset();
    } catch (error) {
        console.error('Error updating customer:', error);
        showMessage('Error updating customer', 'error');
    }
}

async function viewOrderDetails(orderId) {
    try {
        const orderDetails = await api.getOrderDetails(orderId);
        
        if (!orderDetails) {
            showMessage('Order not found', 'error');
            return;
        }

        // Populate order information
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        orderDetailsContent.innerHTML = `
            <div class="order-detail-item">
                <span class="order-detail-label">Order ID</span>
                <span class="order-detail-value">#${orderDetails.id}</span>
            </div>
            <div class="order-detail-item">
                <span class="order-detail-label">Date</span>
                <span class="order-detail-value">${new Date(orderDetails.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
            <div class="order-detail-item">
                <span class="order-detail-label">Status</span>
                <span class="order-detail-value">
                    <span class="status-badge status-${orderDetails.status}">${orderDetails.status}</span>
                </span>
            </div>
            <div class="order-detail-item">
                <span class="order-detail-label">Total Items</span>
                <span class="order-detail-value">${orderDetails.items.length}</span>
            </div>
            <div class="order-detail-item">
                <span class="order-detail-label">Total Amount</span>
                <span class="order-detail-value">₹${orderDetails.total.toFixed(2)}</span>
            </div>
        `;

        // Populate customer information
        const orderCustomerContent = document.getElementById('orderCustomerContent');
        if (orderDetails.customer) {
            orderCustomerContent.innerHTML = `
                <div class="detail-group">
                    <label><i class="fas fa-user"></i> Customer Name</label>
                    <p>${orderDetails.customer.name}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <p>${orderDetails.customer.email || 'N/A'}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> Phone</label>
                    <p>${orderDetails.customer.phone || 'N/A'}</p>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-map-marker-alt"></i> Address</label>
                    <p>${orderDetails.customer.address || 'N/A'}</p>
                </div>
            `;
        } else {
            orderCustomerContent.innerHTML = '<p>Customer information not available</p>';
        }

        // Populate order items with images
        const orderItemsContent = document.getElementById('orderItemsContent');
        if (orderDetails.items && orderDetails.items.length > 0) {
            orderItemsContent.innerHTML = `
                ${orderDetails.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}" 
                             alt="${item.name}" 
                             class="order-item-image"
                             onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'">
                        <div class="order-item-details">
                            <h4 class="order-item-name">${item.name}</h4>
                            ${item.brand ? `<span class="order-item-brand">${item.brand}</span>` : ''}
                            ${item.category ? `<span class="order-item-category">${item.category}</span>` : ''}
                            ${item.sku ? `<span class="order-item-sku">SKU: ${item.sku}</span>` : ''}
                            <div style="display: flex; gap: 20px; margin-top: 8px;">
                                <span class="order-item-price">₹${item.price.toFixed(2)} each</span>
                                <span class="order-item-quantity">Qty: ${item.quantity}</span>
                            </div>
                        </div>
                        <div class="order-item-total">
                            ₹${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
                <div class="order-total-section">
                    <div class="order-total-label">Order Total</div>
                    <div class="order-total-amount">₹${orderDetails.total.toFixed(2)}</div>
                </div>
            `;
        } else {
            orderItemsContent.innerHTML = '<p>No items found in this order</p>';
        }

        // Store current order ID for status updates
        document.getElementById('viewOrderModal').setAttribute('data-order-id', orderId);
        
        openModal('viewOrderModal');
    } catch (error) {
        console.error('Error loading order details:', error);
        showMessage('Error loading order details', 'error');
    }
}

function updateOrderStatus(orderId) {
    showMessage('Update order status functionality coming soon!', 'success');
}

function cleanupCharts() {
    const charts = [
        'salesChart',
        'topProductsChart', 
        'categoryChart',
        'customerChart',
        'inventoryChart',
        'revenueChart'
    ];
    
    charts.forEach(chartName => {
        if (window[chartName] && typeof window[chartName].destroy === 'function') {
            try {
                window[chartName].destroy();
                window[chartName] = null;
            } catch (error) {
                console.log(`Error destroying ${chartName}:`, error);
            }
        }
    });
    
    console.log('Charts cleaned up');
}

async function loadReturns() {
    try {
        const returns = await fetch('/api/returns').then(res => res.json());
        const returnsContainer = document.getElementById('returnsContainer');
        
        if (returns.length === 0) {
            returnsContainer.innerHTML = '<p class="no-data">No return requests found.</p>';
            return;
        }
        
        returnsContainer.innerHTML = returns.map(returnItem => `
            <div class="return-card">
                <div class="return-header">
                    <h3>Return #${returnItem.id}</h3>
                    <span class="status-badge status-${returnItem.status}">${returnItem.status}</span>
                </div>
                <div class="return-details">
                    <p><strong>Customer:</strong> ${returnItem.customerName}</p>
                    <p><strong>Order ID:</strong> #${returnItem.orderId}</p>
                    <p><strong>Request Date:</strong> ${new Date(returnItem.requestDate).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> ₹${returnItem.total.toLocaleString()}</p>
                    <p><strong>Reason:</strong> ${returnItem.reason}</p>
                    ${returnItem.refundNotes ? `<p><strong>Notes:</strong> ${returnItem.refundNotes}</p>` : ''}
                </div>
                <div class="return-items">
                    <h4>Returned Items:</h4>
                    ${returnItem.items.map(item => `
                        <div class="return-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">Qty: ${item.quantity}</span>
                            <span class="item-reason">Reason: ${item.reason}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="return-actions">
                    ${returnItem.status === 'pending' ? `
                        <button class="btn btn-success" onclick="updateReturnStatus(${returnItem.id}, 'approved')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger" onclick="updateReturnStatus(${returnItem.id}, 'rejected')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                    ${returnItem.status === 'approved' ? `
                        <button class="btn btn-warning" onclick="updateReturnStatus(${returnItem.id}, 'refunded')">
                            <i class="fas fa-money-bill"></i> Process Refund
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="viewReturnDetails(${returnItem.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading returns:', error);
        showMessage('Error loading returns', 'error');
    }
}

async function updateReturnStatus(returnId, status) {
    const refundNotes = status === 'refunded' ? prompt('Enter refund notes (optional):') : null;
    
    try {
        const response = await fetch(`/api/returns/${returnId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                refundNotes: refundNotes
            })
        });
        
        if (response.ok) {
            loadReturns();
            showMessage(`Return ${status} successfully`, 'success');
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error updating return status', 'error');
        }
    } catch (error) {
        showMessage('Error updating return status', 'error');
        console.error('Error:', error);
    }
}

async function viewReturnDetails(returnId) {
    try {
        const response = await fetch(`/api/returns/${returnId}`);
        const returnItem = await response.json();
        
        if (response.ok) {
            showReturnDetailsModal(returnItem);
        } else {
            showMessage(returnItem.error || 'Error loading return details', 'error');
        }
    } catch (error) {
        showMessage('Error loading return details', 'error');
        console.error('Error:', error);
    }
}

function showReturnDetailsModal(returnItem) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Return Details - #${returnItem.id}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="return-info-section">
                    <h3><i class="fas fa-info-circle"></i> Return Information</h3>
                    <div class="return-details">
                        <div class="return-detail-item">
                            <span class="return-detail-label">Return ID:</span>
                            <span class="return-detail-value">#${returnItem.id}</span>
                        </div>
                        <div class="return-detail-item">
                            <span class="return-detail-label">Order ID:</span>
                            <span class="return-detail-value">#${returnItem.orderId}</span>
                        </div>
                        <div class="return-detail-item">
                            <span class="return-detail-label">Customer:</span>
                            <span class="return-detail-value">${returnItem.customerName}</span>
                        </div>
                        <div class="return-detail-item">
                            <span class="return-detail-label">Status:</span>
                            <span class="return-detail-value">
                                <span class="status-badge status-${returnItem.status}">${returnItem.status}</span>
                            </span>
                        </div>
                        <div class="return-detail-item">
                            <span class="return-detail-label">Request Date:</span>
                            <span class="return-detail-value">${new Date(returnItem.requestDate).toLocaleString()}</span>
                        </div>
                        ${returnItem.processedDate ? `
                            <div class="return-detail-item">
                                <span class="return-detail-label">Processed Date:</span>
                                <span class="return-detail-value">${new Date(returnItem.processedDate).toLocaleString()}</span>
                            </div>
                        ` : ''}
                        <div class="return-detail-item">
                            <span class="return-detail-label">Reason:</span>
                            <span class="return-detail-value">${returnItem.reason}</span>
                        </div>
                        ${returnItem.refundNotes ? `
                            <div class="return-detail-item">
                                <span class="return-detail-label">Refund Notes:</span>
                                <span class="return-detail-value">${returnItem.refundNotes}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="return-items-section">
                    <h3><i class="fas fa-box"></i> Returned Items</h3>
                    <div class="return-items">
                        ${returnItem.items.map(item => `
                            <div class="return-item">
                                <div class="return-item-details">
                                    <h4 class="return-item-name">${item.name}</h4>
                                    <div style="display: flex; gap: 20px; margin-top: 8px;">
                                        <span class="return-item-price">₹${item.price.toLocaleString()} each</span>
                                        <span class="return-item-quantity">Qty: ${item.quantity}</span>
                                    </div>
                                    <div class="return-item-reason">Reason: ${item.reason}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="return-total-section">
                    <div class="return-total-label">Total Return Amount:</div>
                    <div class="return-total-amount">₹${returnItem.total.toLocaleString()}</div>
                </div>
                
                ${returnItem.status === 'pending' ? `
                    <div class="return-actions">
                        <button class="btn btn-success" onclick="updateReturnStatus(${returnItem.id}, 'approved')">
                            <i class="fas fa-check"></i> Approve Return
                        </button>
                        <button class="btn btn-danger" onclick="updateReturnStatus(${returnItem.id}, 'rejected')">
                            <i class="fas fa-times"></i> Reject Return
                        </button>
                    </div>
                ` : ''}
                
                ${returnItem.status === 'approved' ? `
                    <div class="return-actions">
                        <button class="btn btn-warning" onclick="updateReturnStatus(${returnItem.id}, 'refunded')">
                            <i class="fas fa-money-bill"></i> Process Refund
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function filterReturns() {
    const statusFilter = document.getElementById('returnsStatusFilter').value;
    const returnCards = document.querySelectorAll('.return-card');
    
    returnCards.forEach(card => {
        const status = card.querySelector('.status-badge')?.textContent.toLowerCase();
        
        if (!statusFilter || status === statusFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
} 