document.addEventListener('DOMContentLoaded', () => {
    // Set username from session storage
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
        document.getElementById('username').value = username;
    }

    // Load user settings
    loadUserSettings();

    // Setup event listeners
    document.getElementById('accountForm').addEventListener('submit', handleAccountUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('notificationForm').addEventListener('submit', handleNotificationUpdate);
    document.getElementById('systemForm').addEventListener('submit', handleSystemUpdate);
});

async function loadUserSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        // Update account form
        document.getElementById('email').value = settings.email || '';
        document.getElementById('fullName').value = settings.fullName || '';

        // Update notification settings
        document.getElementById('emailNotifications').checked = settings.notifications.email;
        document.getElementById('lowStockAlerts').checked = settings.notifications.lowStock;
        document.getElementById('orderUpdates').checked = settings.notifications.orders;

        // Update system settings
        document.getElementById('language').value = settings.system.language;
        document.getElementById('timezone').value = settings.system.timezone;
        document.getElementById('dateFormat').value = settings.system.dateFormat;
    } catch (error) {
        showMessage('Error loading settings', 'error');
        console.error('Error:', error);
    }
}

async function handleAccountUpdate(e) {
    e.preventDefault();

    const accountData = {
        email: document.getElementById('email').value,
        fullName: document.getElementById('fullName').value
    };

    try {
        const response = await fetch('/api/settings/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        });

        if (response.ok) {
            showMessage('Account updated successfully', 'success');
        } else {
            throw new Error('Failed to update account');
        }
    } catch (error) {
        showMessage('Error updating account', 'error');
        console.error('Error:', error);
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }

    const passwordData = {
        currentPassword,
        newPassword
    };

    try {
        const response = await fetch('/api/settings/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordData)
        });

        if (response.ok) {
            document.getElementById('passwordForm').reset();
            showMessage('Password changed successfully', 'success');
        } else {
            throw new Error('Failed to change password');
        }
    } catch (error) {
        showMessage('Error changing password', 'error');
        console.error('Error:', error);
    }
}

async function handleNotificationUpdate(e) {
    e.preventDefault();

    const notificationData = {
        email: document.getElementById('emailNotifications').checked,
        lowStock: document.getElementById('lowStockAlerts').checked,
        orders: document.getElementById('orderUpdates').checked
    };

    try {
        const response = await fetch('/api/settings/notifications', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationData)
        });

        if (response.ok) {
            showMessage('Notification preferences updated successfully', 'success');
        } else {
            throw new Error('Failed to update notification preferences');
        }
    } catch (error) {
        showMessage('Error updating notification preferences', 'error');
        console.error('Error:', error);
    }
}

async function handleSystemUpdate(e) {
    e.preventDefault();

    const systemData = {
        language: document.getElementById('language').value,
        timezone: document.getElementById('timezone').value,
        dateFormat: document.getElementById('dateFormat').value
    };

    try {
        const response = await fetch('/api/settings/system', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(systemData)
        });

        if (response.ok) {
            showMessage('System settings updated successfully', 'success');
        } else {
            throw new Error('Failed to update system settings');
        }
    } catch (error) {
        showMessage('Error updating system settings', 'error');
        console.error('Error:', error);
    }
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