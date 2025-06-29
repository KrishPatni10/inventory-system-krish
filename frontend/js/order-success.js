document.addEventListener('DOMContentLoaded', function() {
    console.log('Order success page loaded');
    
    // Get order ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        showError('Order ID not found');
    }
    
    // Add event listeners
    document.getElementById('continueShoppingBtn').addEventListener('click', () => {
        window.location.href = '/customer-dashboard';
    });
    
    document.getElementById('viewOrdersBtn').addEventListener('click', () => {
        if (orderId) {
            window.location.href = `/customer-dashboard#orders?orderId=${orderId}`;
        } else {
            window.location.href = '/customer-dashboard#orders';
        }
    });
});

async function loadUserInfo() {
    try {
        const username = sessionStorage.getItem('username') || 'Customer';
        document.getElementById('username').textContent = username;
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadOrderDetails(orderId) {
    try {
        // Load order details
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const orderDetails = await response.json();
            displayOrderDetails(orderDetails);
        } else {
            console.error('Error loading order details');
            window.location.href = 'customer-dashboard.html';
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        window.location.href = 'customer-dashboard.html';
    }
}

function displayOrderDetails(orderDetails) {
    // Display order information
    document.getElementById('orderId').textContent = `#${orderDetails.id}`;
    document.getElementById('orderDate').textContent = new Date(orderDetails.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Display payment method
    const paymentMethod = getPaymentMethodDisplay(orderDetails.paymentMethod);
    document.getElementById('paymentMethod').textContent = paymentMethod;
    
    // Display order status
    const statusElement = document.getElementById('orderStatus');
    statusElement.textContent = orderDetails.status;
    statusElement.className = `status-badge status-${orderDetails.status}`;
    
    // Display order items
    displayOrderItems(orderDetails.items);
    
    // Calculate and display totals
    calculateAndDisplayTotals(orderDetails.items);
    
    // Display shipping information
    displayShippingInfo(orderDetails);
}

function getPaymentMethodDisplay(method) {
    const methods = {
        'cod': 'Cash on Delivery',
        'card': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking'
    };
    return methods[method] || method;
}

function displayOrderItems(items) {
    const itemsContainer = document.getElementById('orderItems');
    
    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-items">
                <p>No items found in this order.</p>
            </div>
        `;
        return;
    }
    
    itemsContainer.innerHTML = items.map(item => `
        <div class="order-item">
            <img src="${item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}" 
                 alt="${item.name}" 
                 class="order-item-image"
                 onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'">
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                ${item.brand ? `<div class="order-item-price">${item.brand}</div>` : ''}
                <div class="order-item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="order-item-total">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
}

function calculateAndDisplayTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);
}

function displayShippingInfo(orderDetails) {
    const shippingInfoContainer = document.getElementById('shippingInfo');
    
    // Extract shipping information from order details
    const shippingInfo = orderDetails.customerInfo || {};
    
    shippingInfoContainer.innerHTML = `
        <div class="shipping-info-item">
            <div class="shipping-info-icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="shipping-info-content">
                <div class="shipping-info-label">Recipient Name</div>
                <div class="shipping-info-value">${shippingInfo.name || 'N/A'}</div>
            </div>
        </div>
        <div class="shipping-info-item">
            <div class="shipping-info-icon">
                <i class="fas fa-phone"></i>
            </div>
            <div class="shipping-info-content">
                <div class="shipping-info-label">Phone Number</div>
                <div class="shipping-info-value">${shippingInfo.phone || 'N/A'}</div>
            </div>
        </div>
        <div class="shipping-info-item">
            <div class="shipping-info-icon">
                <i class="fas fa-envelope"></i>
            </div>
            <div class="shipping-info-content">
                <div class="shipping-info-label">Email Address</div>
                <div class="shipping-info-value">${shippingInfo.email || 'N/A'}</div>
            </div>
        </div>
        <div class="shipping-info-item">
            <div class="shipping-info-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="shipping-info-content">
                <div class="shipping-info-label">Shipping Address</div>
                <div class="shipping-info-value">
                    ${shippingInfo.address || 'N/A'}<br>
                    ${shippingInfo.city || ''} ${shippingInfo.state || ''} ${shippingInfo.pincode || ''}
                </div>
            </div>
        </div>
    `;
}

function handleLogout() {
    // Clear cart and session
    localStorage.removeItem('cart');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/';
}

// Add confetti effect for celebration
function addConfettiEffect() {
    // Simple confetti effect
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = 'confettiFall 3s linear forwards';
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
}

// Add confetti CSS animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Trigger confetti effect when page loads
setTimeout(addConfettiEffect, 1000);

// Helper function to format prices consistently
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return `₹${price.toLocaleString('en-IN')}`;
} 