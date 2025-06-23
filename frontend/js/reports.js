document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

    // Load initial data
    loadDashboardStats();
    loadBrandStats();
    initializeCharts();
});

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard');
        const stats = await response.json();

        document.getElementById('totalProducts').textContent = stats.total_products;
        document.getElementById('lowStockCount').textContent = stats.low_stock_count;
        document.getElementById('totalValue').textContent = `$${stats.total_value.toFixed(2)}`;
        document.getElementById('totalOrders').textContent = stats.total_orders || '0';
    } catch (error) {
        showMessage('Error loading dashboard statistics', 'error');
        console.error('Error:', error);
    }
}

async function loadBrandStats() {
    try {
        const response = await fetch('/api/brands');
        const brandStats = await response.json();
        
        const tbody = document.getElementById('brandStatsBody');
        tbody.innerHTML = brandStats.map(brand => `
            <tr>
                <td>${brand.name}</td>
                <td>${brand.product_count}</td>
                <td>$${brand.total_value.toFixed(2)}</td>
                <td>${brand.low_stock_count}</td>
            </tr>
        `).join('');

        // Update brand distribution chart
        updateBrandChart(brandStats);
    } catch (error) {
        showMessage('Error loading brand statistics', 'error');
        console.error('Error:', error);
    }
}

let brandChart, categoryChart, salesChart, productsChart;

function initializeCharts() {
    // Brand Distribution Chart
    const brandCtx = document.getElementById('brandChart').getContext('2d');
    brandChart = new Chart(brandCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Monthly Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sales',
                data: [],
                borderColor: '#36A2EB',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Top Products Chart
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    productsChart = new Chart(productsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Sales',
                data: [],
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateBrandChart(brandStats) {
    brandChart.data.labels = brandStats.map(brand => brand.name);
    brandChart.data.datasets[0].data = brandStats.map(brand => brand.product_count);
    brandChart.update();
}

async function updateReports() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        // Update dashboard stats
        await loadDashboardStats();

        // Update brand stats
        await loadBrandStats();

        // Update sales chart
        const salesResponse = await fetch(`/api/sales?start=${startDate}&end=${endDate}`);
        const salesData = await salesResponse.json();
        updateSalesChart(salesData);

        // Update top products chart
        const productsResponse = await fetch(`/api/top-products?start=${startDate}&end=${endDate}`);
        const productsData = await productsResponse.json();
        updateProductsChart(productsData);

        showMessage('Reports updated successfully', 'success');
    } catch (error) {
        showMessage('Error updating reports', 'error');
        console.error('Error:', error);
    }
}

function updateSalesChart(salesData) {
    salesChart.data.labels = salesData.map(sale => sale.date);
    salesChart.data.datasets[0].data = salesData.map(sale => sale.amount);
    salesChart.update();
}

function updateProductsChart(productsData) {
    productsChart.data.labels = productsData.map(product => product.name);
    productsChart.data.datasets[0].data = productsData.map(product => product.sales);
    productsChart.update();
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