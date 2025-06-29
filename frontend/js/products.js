document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Load products
    loadProducts();

    // Setup event listeners
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('bulkUploadForm').addEventListener('submit', handleBulkUpload);
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));

    // Add barcode input event listener
    document.getElementById('barcodeInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scanBarcode();
        }
    });
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        showMessage('Error loading products', 'error');
        console.error('Error:', error);
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${product.brand}</td>
            <td>${product.category}</td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>${product.quantity}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        brand: document.getElementById('productBrand').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        description: document.getElementById('productDescription').value
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            closeModal('addProductModal');
            document.getElementById('addProductForm').reset();
            loadProducts();
            showMessage('Product added successfully', 'success');
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        showMessage('Error adding product', 'error');
        console.error('Error:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts();
            showMessage('Product deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        showMessage('Error deleting product', 'error');
        console.error('Error:', error);
    }
}

function editProduct(productId) {
    // TODO: Implement edit functionality
    showMessage('Edit functionality coming soon', 'info');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Modal Functions
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

function openBulkUploadModal() {
    document.getElementById('bulkUploadModal').style.display = 'block';
    document.getElementById('uploadResults').style.display = 'none';
    document.getElementById('bulkUploadForm').reset();
}

function openBarcodeScanner() {
    document.getElementById('barcodeScannerModal').style.display = 'block';
    document.getElementById('scanResults').style.display = 'none';
    document.getElementById('barcodeInput').value = '';
    document.getElementById('barcodeInput').focus();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Bulk Upload Functions
async function handleBulkUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('uploadFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessage('Please select a file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/products/bulk-upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showUploadResults(result);
            loadProducts(); // Refresh the products list
        } else {
            showMessage(result.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showMessage('Error uploading file', 'error');
        console.error('Error:', error);
    }
}

function showUploadResults(result) {
    const resultsDiv = document.getElementById('uploadResults');
    const contentDiv = document.getElementById('uploadResultsContent');
    
    let html = `
        <div class="result-summary">
            <p><strong>${result.message}</strong></p>
            <p>✅ Successfully added: ${result.success_count} products</p>
            <p>❌ Errors: ${result.error_count}</p>
        </div>
    `;
    
    if (result.errors && result.errors.length > 0) {
        html += '<div class="error-details"><h4>Error Details:</h4><ul>';
        result.errors.forEach(error => {
            html += `<li>${error}</li>`;
        });
        html += '</ul></div>';
    }
    
    contentDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Download Functions
function downloadProductsCSV() {
    window.location.href = '/api/products/download-csv';
}

// Barcode Scanner Functions
async function scanBarcode() {
    const sku = document.getElementById('barcodeInput').value.trim();
    
    if (!sku) {
        showMessage('Please enter a SKU', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/products/scan/${sku}`);
        const result = await response.json();
        
        if (response.ok) {
            showScanResults(result.product);
        } else {
            showMessage(result.error || 'Product not found', 'error');
        }
    } catch (error) {
        showMessage('Error scanning barcode', 'error');
        console.error('Error:', error);
    }
}

function showScanResults(product) {
    const resultsDiv = document.getElementById('scanResults');
    const contentDiv = document.getElementById('scanResultsContent');
    
    const html = `
        <div class="product-scan-result">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Price:</strong> ₹${product.price.toLocaleString()}</p>
                <p><strong>Quantity:</strong> ${product.quantity}</p>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="generateQRCode(${product.id})">
                    <i class="fas fa-qrcode"></i> Generate QR Code
                </button>
                <button class="btn btn-secondary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Edit Product
                </button>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

async function generateQRCode(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/qr-code`);
        const result = await response.json();
        
        if (response.ok) {
            showQRCodeModal(result);
        } else {
            showMessage(result.error || 'Error generating QR code', 'error');
        }
    } catch (error) {
        showMessage('Error generating QR code', 'error');
        console.error('Error:', error);
    }
}

function showQRCodeModal(result) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>QR Code - ${result.product.name}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="qr-code-container">
                    <img src="${result.qr_code}" alt="QR Code" style="max-width: 300px; display: block; margin: 0 auto;">
                    <div class="qr-info">
                        <p><strong>Product:</strong> ${result.product.name}</p>
                        <p><strong>SKU:</strong> ${result.product.sku}</p>
                        <p><strong>Price:</strong> ₹${result.product.price.toLocaleString()}</p>
                    </div>
                    <button class="btn btn-primary" onclick="downloadQRCode('${result.qr_code}', '${result.product.sku}')">
                        <i class="fas fa-download"></i> Download QR Code
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadQRCode(qrCodeDataUrl, sku) {
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${sku}.png`;
    link.click();
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