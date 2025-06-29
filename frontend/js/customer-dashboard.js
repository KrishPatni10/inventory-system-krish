document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer dashboard loaded');
    
    // Load initial data
    loadUserInfo();
    loadProducts();
    loadCart();
    loadOrders();
    loadReturns();

    // Add event listeners
    document.getElementById('logout').addEventListener('click', handleLogout);

    // Add AI search event listeners
    const aiSearchInput = document.getElementById('aiSearchInput');
    const aiSearchBtn = document.getElementById('aiSearchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (aiSearchBtn) {
        aiSearchBtn.addEventListener('click', handleAISearch);
    }

    if (aiSearchInput) {
        aiSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAISearch();
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearAISearch);
    }

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

    // Add search functionality for the top search bar
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // --- NEW: Check for orderId in URL and open order details ---
    const hash = window.location.hash;
    if (hash.startsWith('#orders')) {
        const query = window.location.hash.split('?')[1];
        if (query) {
            const params = new URLSearchParams(query);
            const orderId = params.get('orderId');
            if (orderId) {
                setTimeout(() => viewOrderDetails(orderId), 500);
            }
        }
    }
});

// Helper function to format prices consistently
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sectionEl => sectionEl.classList.remove('active'));
    
    // Show the selected section if it exists
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        // fallback: show products if section not found
        const productsSection = document.getElementById('products');
        if (productsSection) productsSection.classList.add('active');
    }
    
    // Load specific data for the section
    switch(sectionName) {
        case 'products':
            loadProducts();
            break;
        case 'cart':
            loadCart();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'returns':
            loadReturns();
            break;
    }
}

async function loadUserInfo() {
    try {
        const username = sessionStorage.getItem('username') || 'Customer';
        document.getElementById('username').textContent = username;
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            credentials: 'include'
        });
        const products = await response.json();
        
        const productsContainer = document.getElementById('productsContainer');

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-data">No products available at the moment.</p>';
            return;
        }

        productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}" data-category="${product.category || 'Uncategorized'}" data-price="${product.price}">
            <div class="product-image">
                    <img src="${getProductImage(product.category)}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDMwIDEwMEMxMzAgMTE2LjU2OSAxMTYuNTY5IDEzMCAxMDAgMTMwQzgzLjQzMSAxMzAgNzAgMTE2LjU2OSA3MCAxMEM3MCA4My40MzEgODMuNDMxIDcwIDEwMCA3MFoiIGZpbGw9IiNEMzQ3RjAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand || 'N/A'}</p>
                    <p class="product-category">${product.category || 'Uncategorized'}</p>
                    <p class="product-sku">SKU: ${product.sku}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
                    <p class="product-stock ${product.quantity < 10 ? 'low-stock' : ''}">
                        <i class="fas fa-warehouse"></i> 
                        ${product.quantity} in stock
                </p>
                </div>
                <div class="product-actions">
                <button class="btn btn-primary" 
                    onclick="addToCart(${product.id})"
                    ${product.quantity === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> 
                        ${product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="btn btn-secondary" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error loading products', 'error');
    }
}

function getProductImage(category) {
    const imageMap = {
        'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
        'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
        'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
        'Wearables': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
    };
    return imageMap[category] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productBrand = card.querySelector('.product-brand').textContent.toLowerCase();
        const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
        const productSku = card.querySelector('.product-sku').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || 
            productBrand.includes(searchTerm) || 
            productCategory.includes(searchTerm) ||
            productSku.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToCart(productId) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Get product details from the products data instead of DOM
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) {
            showMessage('Product not found', 'error');
            return;
        }
        
        // Get the raw price from the data attribute
        const productPrice = parseInt(productCard.getAttribute('data-price'));
        
        if (isNaN(productPrice)) {
            showMessage('Invalid product price', 'error');
            return;
        }
        
        const productName = productCard.querySelector('.product-name').textContent;
        const productBrand = productCard.querySelector('.product-brand').textContent;
        const productCategory = productCard.querySelector('.product-category').textContent;
        const productImage = productCard.querySelector('.product-image img').src;
        
        cart.push({
            id: productId,
            name: productName,
            brand: productBrand,
            category: productCategory,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    loadCart();
    
    // Show success message
    showMessage('Product added to cart!', 'success');
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="no-data">Your cart is empty. Add some products!</p>';
        cartTotal.textContent = '₹0';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)} x ${item.quantity}</p>
            </div>
            <div class="item-actions">
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    cartTotal.textContent = formatPrice(total);
}

function updateCartItemQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (newQuantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    showMessage('Item removed from cart', 'success');
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders', {
            credentials: 'include'
        });
        const orders = await response.json();
        
        const ordersContainer = document.getElementById('ordersContainer');
        
        // Get current customer information to filter orders
        let currentCustomerId = 1; // Default fallback
        try {
            const currentCustomer = await api.getCurrentCustomer();
            currentCustomerId = currentCustomer.id;
        } catch (error) {
            console.warn('Could not get current customer, using default ID');
        }
        
        // Filter orders for current customer
        const customerOrders = orders.filter(order => order.customerId === currentCustomerId);
        
        if (customerOrders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-data">No orders found. Start shopping to see your orders here!</p>';
            return;
        }
        
        ordersContainer.innerHTML = customerOrders.map(order => {
            // Get first item for preview (if any)
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
            let previewImage = '';
            let previewName = '';
            if (firstItem) {
                previewImage = `<img class="order-preview-image" src="${firstItem.image || getProductImage(firstItem.category)}" alt="${firstItem.name}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'">`;
                previewName = `<span class="order-preview-name">${firstItem.name}</span>`;
            }
            return `
                <div class="order-card">
                    <div class="order-preview">
                        ${previewImage}
                        ${previewName}
                    </div>
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
                        <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                        <p><strong>Items:</strong> ${order.items.length} item(s)</p>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Error loading orders', 'error');
    }
}

async function loadReturns() {
    try {
        const response = await fetch('/api/returns', {
            credentials: 'include'
        });
        const returns = await response.json();
        
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
                    <p><strong>Order ID:</strong> #${returnItem.orderId}</p>
                    <p><strong>Request Date:</strong> ${new Date(returnItem.requestDate).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> ${formatPrice(returnItem.total)}</p>
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
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading returns:', error);
        showMessage('Error loading returns', 'error');
    }
}

async function requestReturn(orderId, items, reason) {
    try {
        const returnData = {
            orderId: orderId,
            items: items,
            reason: reason
        };

        const response = await fetch('/api/returns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(returnData)
        });

        if (response.ok) {
            showMessage('Return request submitted successfully!', 'success');
            closeModal('returnRequestModal');
            loadReturns();
        } else {
            const error = await response.json();
            showMessage('Error submitting return request: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('Error submitting return request:', error);
        showMessage('Error submitting return request', 'error');
    }
}

function viewProductDetails(productId) {
    showMessage('Product details view coming soon!', 'success');
}

async function viewOrderDetails(orderId) {
    try {
        const orderDetails = await api.getOrderDetails(orderId);
        
        if (!orderDetails) {
            showMessage('Order not found', 'error');
            return;
        }

        // Create a simple modal for order details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Order #${orderDetails.id} Details</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-info-section">
                        <h3><i class="fas fa-info-circle"></i> Order Information</h3>
                        <div class="order-details">
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
                                <span class="order-detail-value">${formatPrice(orderDetails.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-items-section">
                        <h3><i class="fas fa-shopping-bag"></i> Order Items</h3>
                        <div class="order-items">
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
                                            <span class="order-item-price">${formatPrice(item.price)} each</span>
                                            <span class="order-item-quantity">Qty: ${item.quantity}</span>
                                        </div>
                                    </div>
                                    <div class="order-item-total">
                                        ${formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            `).join('')}
                            <div class="order-total-section">
                                <div class="order-total-label">Order Total</div>
                                <div class="order-total-amount">${formatPrice(orderDetails.total)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    ${orderDetails.status === 'completed' ? `
                        <button class="btn btn-warning" onclick="openReturnRequestModal(${orderDetails.id})">
                            <i class="fas fa-undo"></i> Request Return
                        </button>
                    ` : ''}
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
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showMessage('Error loading order details', 'error');
    }
}

function openReturnRequestModal(orderId) {
    // Close the current modal first
    const currentModal = document.querySelector('.modal');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Create return request modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Request Return - Order #${orderId}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="returnRequestForm">
                    <div class="form-group">
                        <label for="returnReason">Return Reason</label>
                        <select id="returnReason" required>
                            <option value="">Select a reason</option>
                            <option value="Defective product">Defective product</option>
                            <option value="Wrong size">Wrong size</option>
                            <option value="Not as described">Not as described</option>
                            <option value="Changed mind">Changed mind</option>
                            <option value="Better alternative found">Better alternative found</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="returnDetails">Additional Details</label>
                        <textarea id="returnDetails" rows="3" placeholder="Please provide more details about your return request..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Submit Return Request
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('returnRequestForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const reason = document.getElementById('returnReason').value;
        const details = document.getElementById('returnDetails').value;
        
        if (!reason) {
            showMessage('Please select a return reason', 'error');
            return;
        }
        
        // For now, we'll create a simple return request with the first item
        // In a real app, you'd let users select specific items
        const returnData = {
            orderId: orderId,
            items: [{
                id: 1, // This would be dynamic in a real app
                name: 'Product from Order',
                price: 1000,
                quantity: 1,
                reason: reason
            }],
            reason: details ? `${reason}: ${details}` : reason
        };
        
        const success = await requestReturn(orderId, returnData.items, returnData.reason);
        if (success) {
            modal.remove();
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function handleLogout() {
    // Clear cart and session
    localStorage.removeItem('cart');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 1001;
        animation: messageSlideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ${type === 'success' ? 'background-color: #28a745;' : 
          type === 'error' ? 'background-color: #dc3545;' : 
          type === 'info' ? 'background-color: #17a2b8;' : 
          'background-color: #6c757d;'}
    `;
    
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
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

async function handleAISearch() {
    const searchInput = document.getElementById('aiSearchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage('Please enter a search query', 'error');
        return;
    }
    
    // Show loading spinner
    const loadingDiv = document.getElementById('searchLoading');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    loadingDiv.style.display = 'flex';
    resultsInfo.style.display = 'none';
    
    try {
        // Perform AI search
        const searchResults = await api.searchProductsAI(query);
        
        // Hide loading spinner
        loadingDiv.style.display = 'none';
        
        // Display results
        displaySearchResults(searchResults);
        
        // Show results info
        const resultsCount = document.getElementById('searchResultsCount');
        resultsCount.textContent = `Found ${searchResults.total_results} product(s) for "${query}"`;
        resultsInfo.style.display = 'flex';
        
        // Show applied filters if any
        if (searchResults.filters_applied) {
            const filters = searchResults.filters_applied;
            let filterText = 'Filters applied: ';
            const appliedFilters = [];
            
            if (filters.brand) appliedFilters.push(`Brand: ${filters.brand}`);
            if (filters.category) appliedFilters.push(`Category: ${filters.category}`);
            if (filters.min_price) appliedFilters.push(`Min Price: ${formatPrice(filters.min_price)}`);
            if (filters.max_price) appliedFilters.push(`Max Price: ${formatPrice(filters.max_price)}`);
            if (filters.keywords.length > 0) appliedFilters.push(`Keywords: ${filters.keywords.join(', ')}`);
            
            if (appliedFilters.length > 0) {
                filterText += appliedFilters.join(', ');
                console.log(filterText);
            }
        }
        
    } catch (error) {
        console.error('Error performing AI search:', error);
        loadingDiv.style.display = 'none';
        showMessage('Error performing search: ' + error.message, 'error');
    }
}

function displaySearchResults(searchResults) {
    const productsContainer = document.getElementById('productsContainer');
    
    if (searchResults.products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or browse all products.</p>
                <button class="btn btn-primary" onclick="clearAISearch()">Show All Products</button>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = searchResults.products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                <p><strong>Price:</strong> ${formatPrice(product.price)}</p>
                <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                <p><strong>Stock:</strong> ${product.quantity} units</p>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" onclick="viewProductDetails(${product.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

function clearAISearch() {
    const searchInput = document.getElementById('aiSearchInput');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    // Clear search input
    searchInput.value = '';
    
    // Hide results info
    resultsInfo.style.display = 'none';
    
    // Reload all products
    loadProducts();
    
    showMessage('Search cleared, showing all products', 'success');
} 