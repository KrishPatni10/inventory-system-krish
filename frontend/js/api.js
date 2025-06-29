// API base URL
const API_BASE_URL = '';

const api = {
    // Authentication
    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        return response.json();
    },

    // Products
    async getProducts() {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        return response.json();
    },

    async createProduct(productData) {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to create product');
        }

        return response.json();
    },

    async updateProduct(id, productData) {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        return response.json();
    },

    async deleteProduct(id) {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }

        return response.json();
    },

    // Orders
    async getOrders() {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        return response.json();
    },

    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        return response.json();
    },

    async updateOrder(id, orderData) {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to update order');
        }

        return response.json();
    },

    async getOrderDetails(id) {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        return response.json();
    },

    // Customers
    async getCustomers() {
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }

        return response.json();
    },

    async createCustomer(customerData) {
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to create customer');
        }

        return response.json();
    },

    async updateCustomer(id, customerData) {
        const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to update customer');
        }

        return response.json();
    },

    async deleteCustomer(id) {
        const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete customer');
        }

        return response.json();
    },

    async getCurrentCustomer() {
        const response = await fetch(`${API_BASE_URL}/api/customer/me`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch current customer');
        }

        return response.json();
    },

    // Dashboard
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        return response.json();
    },

    // Logout
    async logout() {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    },

    async searchProductsAI(query) {
        const response = await fetch(`${API_BASE_URL}/api/search-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to search products');
        }

        return response.json();
    }
};

// Export all functions
window.api = api; 