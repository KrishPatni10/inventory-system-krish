document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer profile page loaded');
    
    // Load user info and profile data
    loadUserInfo();
    loadProfileData();
    
    // Add event listeners
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    document.getElementById('backToDashboardBtn').addEventListener('click', () => {
        window.location.href = '/customer-dashboard';
    });
    
    // Password validation listeners
    document.getElementById('newPassword').addEventListener('input', validatePasswordStrength);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
});

// Helper function to format prices consistently
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

async function loadUserInfo() {
    try {
        const username = sessionStorage.getItem('username') || 'Customer';
        document.getElementById('username').textContent = username;
        
        // Load customer profile data
        const response = await fetch('/api/customer/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const customerData = await response.json();
            
            // Populate form fields
            document.getElementById('fullName').value = customerData.name || '';
            document.getElementById('email').value = customerData.email || '';
            document.getElementById('phone').value = customerData.phone || '';
            document.getElementById('address').value = customerData.address || '';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        showToast('Error loading profile data', 'error');
    }
}

async function loadProfileStats() {
    try {
        const response = await fetch('/api/orders', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const orders = await response.json();
            
            // Calculate stats
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
            const lastOrder = orders.length > 0 ? orders[0] : null;
            
            // Update stats display
            document.getElementById('totalOrders').textContent = totalOrders;
            document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
            document.getElementById('lastOrderDate').textContent = lastOrder 
                ? new Date(lastOrder.date).toLocaleDateString() 
                : 'Never';
        }
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch('/api/orders', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const orders = await response.json();
            const recentOrders = orders.slice(0, 3); // Get 3 most recent orders
            
            const tbody = document.getElementById('recentOrdersTable');
            
            if (recentOrders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
                            <i class="fas fa-shopping-bag" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                            <h3>No Orders Yet</h3>
                            <p>Start shopping to see your order history here.</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = recentOrders.map(order => `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.items.length} item(s)</td>
                    <td><strong>${formatPrice(order.total)}</strong></td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
    }
}

function toggleEditMode() {
    const inputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
    const editBtn = document.getElementById('editProfileBtn');
    const actions = document.getElementById('profileActions');
    
    const isReadonly = inputs[0].readOnly;
    
    inputs.forEach(input => {
        input.readOnly = !isReadonly;
        if (!isReadonly) {
            input.style.background = '#f8fafc';
        } else {
            input.style.background = '#f1f5f9';
        }
    });
    
    if (isReadonly) {
        editBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Edit';
        editBtn.className = 'btn btn-secondary';
        actions.style.display = 'flex';
    } else {
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
        editBtn.className = 'btn btn-secondary';
        actions.style.display = 'none';
        // Reset form to original values
        loadUserInfo();
    }
}

function cancelEdit() {
    toggleEditMode();
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        const response = await fetch('/api/customer/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Profile updated successfully!', 'success');
            toggleEditMode();
            loadUserInfo();
        } else {
            const error = await response.json();
            showToast(error.error || 'Error updating profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile', 'error');
    }
}

function validatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 3) {
        feedback = 'Weak password';
        strengthDiv.className = 'password-strength weak';
    } else if (strength < 5) {
        feedback = 'Medium strength password';
        strengthDiv.className = 'password-strength medium';
    } else {
        feedback = 'Strong password';
        strengthDiv.className = 'password-strength strong';
    }
    
    strengthDiv.textContent = feedback;
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (confirmPassword === '') {
        matchDiv.textContent = '';
        matchDiv.className = 'password-match';
        return;
    }
    
    if (newPassword === confirmPassword) {
        matchDiv.textContent = 'Passwords match';
        matchDiv.className = 'password-match match';
    } else {
        matchDiv.textContent = 'Passwords do not match';
        matchDiv.className = 'password-match no-match';
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password strength
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // Validate password match
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/customer/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        if (response.ok) {
            showToast('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();
            document.getElementById('passwordStrength').textContent = '';
            document.getElementById('passwordMatch').textContent = '';
        } else {
            const error = await response.json();
            showToast(error.error || 'Error changing password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Error changing password', 'error');
    }
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const orderDetails = await response.json();
            showOrderDetailsModal(orderDetails);
        } else {
            showToast('Error loading order details', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Error loading order details', 'error');
    }
}

function showOrderDetailsModal(orderDetails) {
    const contentDiv = document.getElementById('orderDetailsContent');
    
    const html = `
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
    `;
    
    contentDiv.innerHTML = html;
    document.getElementById('orderDetailsModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function handleLogout() {
    // Clear cart and session
    localStorage.removeItem('cart');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('orderDetailsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}); 