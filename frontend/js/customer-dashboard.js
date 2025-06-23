document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadProducts();
    loadUserInfo();
    loadCart();
    loadOrders();
    loadProfile();

    // Add event listeners
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Add search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Add navigation event listeners
    const navLinks = document.querySelectorAll('.nav-links li[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.getAttribute('data-section');
            // Hide all sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(sectionEl => sectionEl.classList.remove('active'));
            // Show the selected section if it exists
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                // fallback: show products if section not found
                const productsSection = document.getElementById('products');
                if (productsSection) productsSection.classList.add('active');
            }
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            // Load specific data for the section
            switch(section) {
                case 'products':
                    loadProducts();
                    break;
                case 'cart':
                    loadCart();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'profile':
                    loadProfile();
                    break;
            }
        });
    });
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
            case 'products':
                loadProducts();
                break;
            case 'cart':
                loadCart();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'profile':
                loadProfile();
                break;
        }
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
            <div class="product-card" data-product-id="${product.id}" data-category="${product.category || 'Uncategorized'}">
                <div class="product-image">
                    <img src="${getProductImage(product.category)}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDMwIDEwMEMxMzAgMTE2LjU2OSAxMTYuNTY5IDEzMCAxMDAgMTMwQzgzLjQzMSAxMzAgNzAgMTE2LjU2OSA3MCAxMEM3MCA4My40MzEgODMuNDMxIDcwIDEwMCA3MFoiIGZpbGw9IiNEMzQ3RjAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand || 'N/A'}</p>
                    <p class="product-category">${product.category || 'Uncategorized'}</p>
                    <p class="product-sku">SKU: ${product.sku}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
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
        // Get product details
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('$', ''));
        
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    showMessage('Product added to cart!', 'success');
    
    // Update cart display if cart section is active
    if (document.getElementById('cart').classList.contains('active')) {
        loadCart();
    }
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="no-data">Your cart is empty. Add some products!</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
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
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
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
        
        // Filter orders for current customer (in a real app, this would be based on user ID)
        const customerOrders = orders.slice(0, 3); // Show first 3 orders as example
        
        if (customerOrders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-data">No orders found. Start shopping to see your orders here!</p>';
            return;
        }
        
        ordersContainer.innerHTML = customerOrders.map(order => `
            <div class="order-card">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                    <p><strong>Items:</strong> ${order.items.length} item(s)</p>
                </div>
                <div class="order-actions">
                    <button class="btn btn-secondary" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Error loading orders', 'error');
    }
}

async function loadProfile() {
    try {
        // In a real app, this would fetch from API
        const profileData = {
            username: sessionStorage.getItem('username') || 'customer',
            email: 'customer@example.com',
            phone: '+1-555-0123',
            address: '123 Customer St, City, State 12345'
        };
        
        document.getElementById('profileUsername').value = profileData.username;
        document.getElementById('profileEmail').value = profileData.email;
        document.getElementById('profilePhone').value = profileData.phone;
        document.getElementById('profileAddress').value = profileData.address;
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile', 'error');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const profileData = {
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value
    };

    try {
        // In a real app, this would update via API
        showMessage('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile', 'error');
    }
}

async function handleCheckout(event) {
    event.preventDefault();
    
    const checkoutData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };

    try {
        // In a real app, this would process payment and create order
        showMessage('Order placed successfully!', 'success');
        closeModal('checkoutModal');
        
        // Clear cart
        localStorage.removeItem('cart');
        loadCart();
        
        // Reset form
        event.target.reset();
        
        // Switch to orders section
        showSection('orders');
        loadOrders();
    } catch (error) {
        console.error('Error processing checkout:', error);
        showMessage('Error processing checkout', 'error');
    }
}

function viewProductDetails(productId) {
    showMessage('Product details view coming soon!', 'success');
}

function viewOrderDetails(orderId) {
    showMessage('Order details view coming soon!', 'success');
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