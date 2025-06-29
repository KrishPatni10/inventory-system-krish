document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Load returns
    loadReturns();

    // Setup event listeners
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
});

async function loadReturns() {
    try {
        const response = await fetch('/api/returns');
        const returns = await response.json();
        renderReturns(returns);
    } catch (error) {
        showMessage('Error loading returns', 'error');
        console.error('Error:', error);
    }
}

function renderReturns(returns) {
    const tbody = document.getElementById('returnsTableBody');
    tbody.innerHTML = returns.map(returnItem => `
        <tr>
            <td>${returnItem.id}</td>
            <td>${returnItem.customerName}</td>
            <td>#${returnItem.orderId}</td>
            <td>${returnItem.items.length} item(s)</td>
            <td>₹${returnItem.total.toLocaleString()}</td>
            <td><span class="status-badge status-${returnItem.status}">${returnItem.status}</span></td>
            <td>${new Date(returnItem.requestDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewReturnDetails(${returnItem.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${returnItem.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="updateReturnStatus(${returnItem.id}, 'approved')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateReturnStatus(${returnItem.id}, 'rejected')">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                ${returnItem.status === 'approved' ? `
                    <button class="btn btn-sm btn-warning" onclick="updateReturnStatus(${returnItem.id}, 'refunded')">
                        <i class="fas fa-money-bill"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

async function viewReturnDetails(returnId) {
    try {
        const response = await fetch(`/api/returns/${returnId}`);
        const returnItem = await response.json();
        
        if (response.ok) {
            showReturnDetails(returnItem);
        } else {
            showMessage(returnItem.error || 'Error loading return details', 'error');
        }
    } catch (error) {
        showMessage('Error loading return details', 'error');
        console.error('Error:', error);
    }
}

function showReturnDetails(returnItem) {
    const contentDiv = document.getElementById('returnDetailsContent');
    
    const html = `
        <div class="return-details">
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
                            <div class="return-item-image">
                                <img src="${item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}" alt="${item.name}">
                            </div>
                            <div class="return-item-details">
                                <div class="return-item-name">${item.name}</div>
                                <div class="return-item-price">₹${item.price.toLocaleString()}</div>
                                <div class="return-item-quantity">Qty: ${item.quantity}</div>
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
    `;
    
    contentDiv.innerHTML = html;
    document.getElementById('returnDetailsModal').style.display = 'block';
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
            closeModal('returnDetailsModal');
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

function filterReturns() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#returnsTableBody tr');
    
    rows.forEach(row => {
        const status = row.querySelector('.status-badge')?.textContent.toLowerCase();
        const text = row.textContent.toLowerCase();
        
        const statusMatch = !statusFilter || status === statusFilter;
        const searchMatch = !searchTerm || text.includes(searchTerm);
        
        row.style.display = statusMatch && searchMatch ? '' : 'none';
    });
}

function handleSearch(e) {
    filterReturns();
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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