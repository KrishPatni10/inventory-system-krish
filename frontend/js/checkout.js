document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    // Load user info and cart
    loadUserInfo();
    loadCartItems();
    
    // Add form validation
    setupFormValidation();
    
    // Add event listeners
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('checkoutForm').addEventListener('input', validateForm);
    document.getElementById('paymentMethod').addEventListener('change', handlePaymentMethodChange);
    
    // Add input formatting
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
    document.getElementById('pincode').addEventListener('input', formatPincode);
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
    document.getElementById('expiryDate').addEventListener('input', formatExpiryDate);
    document.getElementById('cvv').addEventListener('input', formatCVV);
    
    // Add back to cart button event listener
    const backToCartBtn = document.querySelector('a[href="/customer-dashboard#cart"]');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/customer-dashboard#cart';
        });
    }
});

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

async function loadUserInfo() {
    try {
        const username = sessionStorage.getItem('username') || 'Customer';
        document.getElementById('username').textContent = username;
        
        // Load customer profile data to pre-fill form
        const response = await fetch('/api/customer/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const customerData = await response.json();
            
            // Pre-fill form fields
            document.getElementById('fullName').value = customerData.name || '';
            document.getElementById('email').value = customerData.email || '';
            document.getElementById('phone').value = customerData.phone || '';
            document.getElementById('address').value = customerData.address || '';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('checkoutItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to proceed with checkout.</p>
                <a href="/customer-dashboard" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item.category)}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">
                    <span class="cart-item-price">${formatPrice(item.price)} each</span>
                    <span class="cart-item-quantity">Qty: ${item.quantity}</span>
                </div>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    // Calculate totals after loading cart items
    calculateTotals();
}

function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);
}

function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const cardDetails = document.getElementById('cardDetails');
    
    if (paymentMethod === 'card') {
        cardDetails.style.display = 'block';
        // Make card fields required
        document.getElementById('cardNumber').required = true;
        document.getElementById('expiryDate').required = true;
        document.getElementById('cvv').required = true;
    } else {
        cardDetails.style.display = 'none';
        // Remove required from card fields
        document.getElementById('cardNumber').required = false;
        document.getElementById('expiryDate').required = false;
        document.getElementById('cvv').required = false;
    }
}

function validateForm() {
    let isValid = true;
    
    // Validate Full Name
    const fullName = document.getElementById('fullName').value.trim();
    const fullNameError = document.getElementById('fullNameError');
    if (fullName.length < 2) {
        fullNameError.textContent = 'Full name must be at least 2 characters';
        document.getElementById('fullName').classList.add('error');
        isValid = false;
    } else {
        fullNameError.textContent = '';
        document.getElementById('fullName').classList.remove('error');
        document.getElementById('fullName').classList.add('success');
    }
    
    // Validate Email
    const email = document.getElementById('email').value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        document.getElementById('email').classList.add('error');
        isValid = false;
    } else {
        emailError.textContent = '';
        document.getElementById('email').classList.remove('error');
        document.getElementById('email').classList.add('success');
    }
    
    // Validate Phone
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const phoneError = document.getElementById('phoneError');
    if (phone.length !== 10) {
        phoneError.textContent = 'Phone number must be 10 digits';
        document.getElementById('phone').classList.add('error');
        isValid = false;
    } else {
        phoneError.textContent = '';
        document.getElementById('phone').classList.remove('error');
        document.getElementById('phone').classList.add('success');
    }
    
    // Validate Address
    const address = document.getElementById('address').value.trim();
    const addressError = document.getElementById('addressError');
    if (address.length < 10) {
        addressError.textContent = 'Address must be at least 10 characters';
        document.getElementById('address').classList.add('error');
        isValid = false;
    } else {
        addressError.textContent = '';
        document.getElementById('address').classList.remove('error');
        document.getElementById('address').classList.add('success');
    }
    
    // Validate City
    const city = document.getElementById('city').value.trim();
    const cityError = document.getElementById('cityError');
    if (city.length < 2) {
        cityError.textContent = 'City must be at least 2 characters';
        document.getElementById('city').classList.add('error');
        isValid = false;
    } else {
        cityError.textContent = '';
        document.getElementById('city').classList.remove('error');
        document.getElementById('city').classList.add('success');
    }
    
    // Validate State
    const state = document.getElementById('state').value.trim();
    const stateError = document.getElementById('stateError');
    if (state.length < 2) {
        stateError.textContent = 'State must be at least 2 characters';
        document.getElementById('state').classList.add('error');
        isValid = false;
    } else {
        stateError.textContent = '';
        document.getElementById('state').classList.remove('error');
        document.getElementById('state').classList.add('success');
    }
    
    // Validate Pincode
    const pincode = document.getElementById('pincode').value.replace(/\D/g, '');
    const pincodeError = document.getElementById('pincodeError');
    if (pincode.length !== 6) {
        pincodeError.textContent = 'Pincode must be 6 digits';
        document.getElementById('pincode').classList.add('error');
        isValid = false;
    } else {
        pincodeError.textContent = '';
        document.getElementById('pincode').classList.remove('error');
        document.getElementById('pincode').classList.add('success');
    }
    
    // Validate Payment Method
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentMethodError = document.getElementById('paymentMethodError');
    if (!paymentMethod) {
        paymentMethodError.textContent = 'Please select a payment method';
        document.getElementById('paymentMethod').classList.add('error');
        isValid = false;
    } else {
        paymentMethodError.textContent = '';
        document.getElementById('paymentMethod').classList.remove('error');
        document.getElementById('paymentMethod').classList.add('success');
    }
    
    // Validate Card Details if card payment selected
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\D/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value.replace(/\D/g, '');
        
        if (cardNumber.length !== 16) {
            document.getElementById('cardNumberError').textContent = 'Card number must be 16 digits';
            document.getElementById('cardNumber').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('cardNumberError').textContent = '';
            document.getElementById('cardNumber').classList.remove('error');
            document.getElementById('cardNumber').classList.add('success');
        }
        
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            document.getElementById('expiryDateError').textContent = 'Use format MM/YY';
            document.getElementById('expiryDate').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('expiryDateError').textContent = '';
            document.getElementById('expiryDate').classList.remove('error');
            document.getElementById('expiryDate').classList.add('success');
        }
        
        if (cvv.length < 3 || cvv.length > 4) {
            document.getElementById('cvvError').textContent = 'CVV must be 3-4 digits';
            document.getElementById('cvv').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('cvvError').textContent = '';
            document.getElementById('cvv').classList.remove('error');
            document.getElementById('cvv').classList.add('success');
        }
    }
    
    return isValid;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length >= 6) {
        value = value.slice(0, 5) + '-' + value.slice(5);
    }
    if (value.length >= 3) {
        value = value.slice(0, 2) + '-' + value.slice(2);
    }
    
    event.target.value = value;
}

function formatPincode(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    event.target.value = value;
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    event.target.value = value;
}

function formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    event.target.value = value;
}

function formatCVV(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    event.target.value = value;
}

async function placeOrder() {
    // Validate form
    if (!validateForm()) {
        alert('Please fix the errors in the form before placing your order.');
        return;
    }
    
    // Check if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }
    
    // Show loading modal
    document.getElementById('loadingModal').style.display = 'block';
    
    try {
        // Prepare order data
        const orderData = {
            items: cart,
            customerInfo: {
                name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.replace(/\D/g, ''),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                pincode: document.getElementById('pincode').value.replace(/\D/g, '')
            },
            paymentMethod: document.getElementById('paymentMethod').value,
            total: calculateOrderTotal()
        };
        
        // Create order
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const orderResult = await response.json();
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Hide loading modal
            document.getElementById('loadingModal').style.display = 'none';
            
            // Redirect to success page
            window.location.href = `/order-success?orderId=${orderResult.id}`;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        document.getElementById('loadingModal').style.display = 'none';
        alert('Error placing order: ' + error.message);
    }
}

function calculateOrderTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18);
    return subtotal + shipping + tax;
}

function handleLogout() {
    // Clear cart and session
    localStorage.removeItem('cart');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/';
}

// Close loading modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('loadingModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Helper function to format prices consistently
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return `₹${price.toLocaleString('en-IN')}`;
} 