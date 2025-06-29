from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import os
import json
from datetime import datetime, timedelta
import functools
import qrcode
import io
import base64
from werkzeug.utils import secure_filename
import csv
from PIL import Image

app = Flask(__name__, static_folder='frontend')
CORS(app)
app.secret_key = 'your-secret-key-here'  # Change this to a secure secret key

# Mock database
users = {
    'admin': {
        'password': generate_password_hash('admin123'),
        'role': 'admin'
    },
    'customer': {
        'password': generate_password_hash('customer123'),
        'role': 'customer',
        'customerId': 1  # Link to customer ID 1 (John Smith)
    }
}

# Sample products data
products = [
    {
        'id': 1,
        'name': 'iPhone 15 Pro',
        'sku': 'IPH15PRO-128',
        'brand': 'Apple',
        'price': 83000,  # 999.99 USD * 83 rounded
        'quantity': 25,
        'supplier': 'Apple Inc.',
        'category': 'Smartphones',
        'image': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
    },
    {
        'id': 2,
        'name': 'Samsung Galaxy S24',
        'sku': 'SAMS24-256',
        'brand': 'Samsung',
        'price': 74700,  # 899.99 USD * 83 rounded
        'quantity': 18,
        'supplier': 'Samsung Electronics',
        'category': 'Smartphones',
        'image': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop'
    },
    {
        'id': 3,
        'name': 'MacBook Pro 14"',
        'sku': 'MBP14-M2',
        'brand': 'Apple',
        'price': 166000,  # 1999.99 USD * 83 rounded
        'quantity': 12,
        'supplier': 'Apple Inc.',
        'category': 'Laptops',
        'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
    },
    {
        'id': 4,
        'name': 'Dell XPS 13',
        'sku': 'DELLXPS13-512',
        'brand': 'Dell',
        'price': 107900,  # 1299.99 USD * 83 rounded
        'quantity': 15,
        'supplier': 'Dell Technologies',
        'category': 'Laptops',
        'image': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'
    },
    {
        'id': 5,
        'name': 'AirPods Pro',
        'sku': 'AIRPODS-PRO',
        'brand': 'Apple',
        'price': 20750,  # 249.99 USD * 83 rounded
        'quantity': 50,
        'supplier': 'Apple Inc.',
        'category': 'Audio',
        'image': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
    },
    {
        'id': 6,
        'name': 'Sony WH-1000XM5',
        'sku': 'SONY-WH1000XM5',
        'brand': 'Sony',
        'price': 33200,  # 399.99 USD * 83 rounded
        'quantity': 30,
        'supplier': 'Sony Corporation',
        'category': 'Audio',
        'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    },
    {
        'id': 7,
        'name': 'iPad Air',
        'sku': 'IPAD-AIR-256',
        'brand': 'Apple',
        'price': 58100,  # 699.99 USD * 83 rounded
        'quantity': 22,
        'supplier': 'Apple Inc.',
        'category': 'Tablets',
        'image': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    },
    {
        'id': 8,
        'name': 'Samsung Galaxy Tab S9',
        'sku': 'SAMS9-128',
        'brand': 'Samsung',
        'price': 53950,  # 649.99 USD * 83 rounded
        'quantity': 16,
        'supplier': 'Samsung Electronics',
        'category': 'Tablets',
        'image': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop'
    },
    {
        'id': 9,
        'name': 'Apple Watch Series 9',
        'sku': 'AWATCH-S9-45',
        'brand': 'Apple',
        'price': 33200,  # 399.99 USD * 83 rounded
        'quantity': 35,
        'supplier': 'Apple Inc.',
        'category': 'Wearables',
        'image': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?w=400&h=400&fit=crop'
    },
    {
        'id': 10,
        'name': 'Samsung Galaxy Watch 6',
        'sku': 'SAMSGW6-44',
        'brand': 'Samsung',
        'price': 29050,  # 349.99 USD * 83 rounded
        'quantity': 28,
        'supplier': 'Samsung Electronics',
        'category': 'Wearables',
        'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
    }
]

# Sample customers data
customers = [
    {
        'id': 1,
        'name': 'John Smith',
        'email': 'john.smith@email.com',
        'phone': '+1-555-0123',
        'address': '123 Main St, New York, NY 10001',
        'orderCount': 3,
        'totalSpent': 207500,  # 2499.97 USD * 83 rounded
        'recentOrders': [
            {'id': 1, 'date': '2024-01-15', 'total': 83000, 'status': 'completed'},  # 999.99 USD * 83 rounded
            {'id': 2, 'date': '2024-02-20', 'total': 20750, 'status': 'completed'},  # 249.99 USD * 83 rounded
            {'id': 3, 'date': '2024-03-10', 'total': 103750, 'status': 'pending'}  # 1249.99 USD * 83 rounded
        ]
    },
    {
        'id': 2,
        'name': 'Sarah Johnson',
        'email': 'sarah.j@email.com',
        'phone': '+1-555-0456',
        'address': '456 Oak Ave, Los Angeles, CA 90210',
        'orderCount': 2,
        'totalSpent': 136950,  # 1649.98 USD * 83 rounded
        'recentOrders': [
            {'id': 4, 'date': '2024-02-05', 'total': 74700, 'status': 'completed'},  # 899.99 USD * 83 rounded
            {'id': 5, 'date': '2024-03-15', 'total': 62250, 'status': 'shipped'}  # 749.99 USD * 83 rounded
        ]
    },
    {
        'id': 3,
        'name': 'Mike Davis',
        'email': 'mike.davis@email.com',
        'phone': '+1-555-0789',
        'address': '789 Pine Rd, Chicago, IL 60601',
        'orderCount': 1,
        'totalSpent': 166000,  # 1999.99 USD * 83 rounded
        'recentOrders': [
            {'id': 6, 'date': '2024-03-01', 'total': 166000, 'status': 'completed'}  # 1999.99 USD * 83 rounded
        ]
    },
    {
        'id': 4,
        'name': 'Emily Wilson',
        'email': 'emily.w@email.com',
        'phone': '+1-555-0321',
        'address': '321 Elm St, Miami, FL 33101',
        'orderCount': 4,
        'totalSpent': 157700,  # 1899.96 USD * 83 rounded
        'recentOrders': [
            {'id': 7, 'date': '2024-01-20', 'total': 33200, 'status': 'completed'},  # 399.99 USD * 83 rounded
            {'id': 8, 'date': '2024-02-10', 'total': 53950, 'status': 'completed'},  # 649.99 USD * 83 rounded
            {'id': 9, 'date': '2024-03-05', 'total': 29050, 'status': 'completed'},  # 349.99 USD * 83 rounded
            {'id': 10, 'date': '2024-03-20', 'total': 41500, 'status': 'pending'}  # 499.99 USD * 83 rounded
        ]
    },
    {
        'id': 5,
        'name': 'David Brown',
        'email': 'david.brown@email.com',
        'phone': '+1-555-0654',
        'address': '654 Maple Dr, Seattle, WA 98101',
        'orderCount': 2,
        'totalSpent': 107900,  # 1299.98 USD * 83 rounded
        'recentOrders': [
            {'id': 11, 'date': '2024-02-15', 'total': 107900, 'status': 'completed'},  # 1299.99 USD * 83 rounded
            {'id': 12, 'date': '2024-03-12', 'total': 20750, 'status': 'shipped'}  # 249.99 USD * 83 rounded
        ]
    }
]

# Sample orders data
orders = [
    {
        'id': 1,
        'customerId': 1,
        'items': [
            {'id': 1, 'name': 'iPhone 15 Pro', 'price': 83000, 'quantity': 1, 'image': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'}
        ],
        'total': 83000,
        'status': 'completed',
        'date': '2024-01-15T10:30:00'
    },
    {
        'id': 2,
        'customerId': 1,
        'items': [
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1, 'image': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'}
        ],
        'total': 20750,
        'status': 'completed',
        'date': '2024-02-20T14:15:00'
    },
    {
        'id': 3,
        'customerId': 1,
        'items': [
            {'id': 3, 'name': 'MacBook Pro 14"', 'price': 166000, 'quantity': 1, 'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'},
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1, 'image': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'}
        ],
        'total': 186750,
        'status': 'pending',
        'date': '2024-03-10T09:45:00'
    },
    {
        'id': 4,
        'customerId': 2,
        'items': [
            {'id': 2, 'name': 'Samsung Galaxy S24', 'price': 74700, 'quantity': 1}  # 899.99 USD * 83 rounded
        ],
        'total': 74700,  # 899.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-02-05T16:20:00'
    },
    {
        'id': 5,
        'customerId': 2,
        'items': [
            {'id': 7, 'name': 'iPad Air', 'price': 58100, 'quantity': 1},  # 699.99 USD * 83 rounded
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1}  # 249.99 USD * 83 rounded
        ],
        'total': 78850,  # 949.98 USD * 83 rounded
        'status': 'shipped',
        'date': '2024-03-15T11:30:00'
    },
    {
        'id': 6,
        'customerId': 3,
        'items': [
            {'id': 3, 'name': 'MacBook Pro 14"', 'price': 166000, 'quantity': 1}  # 1999.99 USD * 83 rounded
        ],
        'total': 166000,  # 1999.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-03-01T13:00:00'
    },
    {
        'id': 7,
        'customerId': 4,
        'items': [
            {'id': 6, 'name': 'Sony WH-1000XM5', 'price': 33200, 'quantity': 1}  # 399.99 USD * 83 rounded
        ],
        'total': 33200,  # 399.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-01-20T15:45:00'
    },
    {
        'id': 8,
        'customerId': 4,
        'items': [
            {'id': 8, 'name': 'Samsung Galaxy Tab S9', 'price': 53950, 'quantity': 1}  # 649.99 USD * 83 rounded
        ],
        'total': 53950,  # 649.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-02-10T10:15:00'
    },
    {
        'id': 9,
        'customerId': 4,
        'items': [
            {'id': 10, 'name': 'Samsung Galaxy Watch 6', 'price': 29050, 'quantity': 1}  # 349.99 USD * 83 rounded
        ],
        'total': 29050,  # 349.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-03-05T12:30:00'
    },
    {
        'id': 10,
        'customerId': 4,
        'items': [
            {'id': 9, 'name': 'Apple Watch Series 9', 'price': 33200, 'quantity': 1},  # 399.99 USD * 83 rounded
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1}  # 249.99 USD * 83 rounded
        ],
        'total': 53950,  # 649.98 USD * 83 rounded
        'status': 'pending',
        'date': '2024-03-20T14:00:00'
    },
    {
        'id': 11,
        'customerId': 5,
        'items': [
            {'id': 4, 'name': 'Dell XPS 13', 'price': 107900, 'quantity': 1}  # 1299.99 USD * 83 rounded
        ],
        'total': 107900,  # 1299.99 USD * 83 rounded
        'status': 'completed',
        'date': '2024-02-15T09:00:00'
    },
    {
        'id': 12,
        'customerId': 5,
        'items': [
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1}  # 249.99 USD * 83 rounded
        ],
        'total': 20750,  # 249.99 USD * 83 rounded
        'status': 'shipped',
        'date': '2024-03-12T16:45:00'
    }
]

# Sample returns data
returns = [
    {
        'id': 1,
        'orderId': 1,
        'customerId': 1,
        'customerName': 'John Smith',
        'items': [
            {'id': 1, 'name': 'iPhone 15 Pro', 'price': 83000, 'quantity': 1, 'reason': 'Defective screen'}
        ],
        'total': 83000,
        'status': 'pending',  # pending, approved, refunded, rejected
        'reason': 'Defective product',
        'requestDate': '2024-01-20T11:00:00',
        'processedDate': None,
        'refundNotes': None
    },
    {
        'id': 2,
        'orderId': 2,
        'customerId': 1,
        'customerName': 'John Smith',
        'items': [
            {'id': 5, 'name': 'AirPods Pro', 'price': 20750, 'quantity': 1, 'reason': 'Wrong size'}
        ],
        'total': 20750,
        'status': 'approved',
        'reason': 'Wrong size ordered',
        'requestDate': '2024-02-25T16:30:00',
        'processedDate': '2024-02-26T10:15:00',
        'refundNotes': 'Approved for exchange'
    }
]

# Authentication middleware
def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Static file routes
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('frontend/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('frontend/js', filename)

# Routes
@app.route('/')
def index():
    return send_from_directory('frontend/pages', 'login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in users and check_password_hash(users[username]['password'], password):
        session['user'] = username
        session['role'] = users[username]['role']
        return jsonify({'success': True, 'role': users[username]['role']})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Dashboard routes
@app.route('/admin-dashboard')
@login_required
def admin_dashboard():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'admin-dashboard.html')

@app.route('/customer-dashboard')
@login_required
def customer_dashboard():
    if session['role'] != 'customer':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'customer-dashboard.html')

@app.route('/products')
@login_required
def products_page():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'products.html')

@app.route('/customers')
@login_required
def customers_page():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'customers.html')

@app.route('/orders')
@login_required
def orders_page():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'orders.html')

@app.route('/reports')
@login_required
def reports_page():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'reports.html')

@app.route('/settings')
@login_required
def settings_page():
    if session['role'] != 'admin':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'settings.html')

@app.route('/checkout')
@login_required
def checkout_page():
    if session['role'] != 'customer':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'checkout.html')

@app.route('/customer-profile')
@login_required
def customer_profile_page():
    if session['role'] != 'customer':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'customer-profile.html')

@app.route('/order-success')
@login_required
def order_success_page():
    if session['role'] != 'customer':
        return redirect(url_for('index'))
    return send_from_directory('frontend/pages', 'order-success.html')

# API Routes
@app.route('/api/dashboard')
@login_required
def get_dashboard_stats():
    total_products = len(products)
    low_stock = sum(1 for p in products if p.get('quantity', 0) < 10)
    total_value = sum(p.get('price', 0) * p.get('quantity', 0) for p in products)
    
    # Calculate order statistics
    total_orders = len(orders)
    pending_orders = sum(1 for o in orders if o.get('status') == 'pending')
    completed_orders = sum(1 for o in orders if o.get('status') == 'completed')
    total_revenue = sum(o.get('total', 0) for o in orders if o.get('status') == 'completed')
    
    # Calculate customer statistics
    total_customers = len(customers)
    active_customers = sum(1 for c in customers if c.get('orderCount', 0) > 0)
    
    # Calculate recent activity (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_orders = sum(1 for o in orders if datetime.fromisoformat(o.get('date', '2024-01-01')) > thirty_days_ago)
    recent_revenue = sum(o.get('total', 0) for o in orders 
                        if o.get('status') == 'completed' and 
                        datetime.fromisoformat(o.get('date', '2024-01-01')) > thirty_days_ago)
    
    return jsonify({
        'totalProducts': total_products,
        'lowStock': low_stock,
        'totalValue': total_value,
        'totalOrders': total_orders,
        'pendingOrders': pending_orders,
        'completedOrders': completed_orders,
        'totalRevenue': total_revenue,
        'totalCustomers': total_customers,
        'activeCustomers': active_customers,
        'recentOrders': recent_orders,
        'recentRevenue': recent_revenue
    })

@app.route('/api/products')
@login_required
def get_products():
    limit = request.args.get('limit', type=int)
    if limit:
        return jsonify(products[:limit])
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
@login_required
def create_product():
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    product = {
        'id': len(products) + 1,
        'name': data['name'],
        'sku': data['sku'],
        'brand': data['brand'],
        'price': float(data['price']),
        'quantity': int(data['quantity']),
        'supplier': data['supplier'],
        'category': data['category']
    }
    products.append(product)
    return jsonify(product), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    for product in products:
        if product['id'] == product_id:
            product.update(data)
            return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    for i, product in enumerate(products):
        if product['id'] == product_id:
            products.pop(i)
            return '', 204
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/customers')
@login_required
def get_customers():
    return jsonify(customers)

@app.route('/api/customers', methods=['POST'])
@login_required
def create_customer():
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    customer = {
        'id': len(customers) + 1,
        'name': data['name'],
        'email': data['email'],
        'phone': data['phone'],
        'address': data['address'],
        'orderCount': 0,
        'totalSpent': 0,
        'recentOrders': []
    }
    customers.append(customer)
    return jsonify(customer), 201

@app.route('/api/customers/<int:customer_id>')
@login_required
def get_customer(customer_id):
    for customer in customers:
        if customer['id'] == customer_id:
            return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
@login_required
def update_customer(customer_id):
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    for customer in customers:
        if customer['id'] == customer_id:
            customer.update(data)
            return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
@login_required
def delete_customer(customer_id):
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    for i, customer in enumerate(customers):
        if customer['id'] == customer_id:
            customers.pop(i)
            return '', 204
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/api/customer/me')
@login_required
def get_current_customer():
    if session['role'] != 'customer':
        return jsonify({'error': 'Unauthorized'}), 403
    
    customer_id = users[session['user']]['customerId']
    for customer in customers:
        if customer['id'] == customer_id:
            return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/api/orders')
@login_required
def get_orders():
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
@login_required
def create_order():
    try:
        data = request.get_json()
        
        # Get customer ID based on user role
        if session.get('role') == 'customer':
            customer_id = users[session.get('user')].get('customerId')
        else:
            customer_id = data.get('customerId')
        
        if not customer_id:
            return jsonify({'error': 'Customer ID is required'}), 400
        
        # Find the customer
        customer = next((c for c in customers if c['id'] == customer_id), None)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        # Validate items and check stock
        items = data.get('items', [])
        if not items:
            return jsonify({'error': 'Order must contain at least one item'}), 400
        
        # Check stock availability and reduce quantities
        for item in items:
            product = next((p for p in products if p['id'] == item['id']), None)
            if not product:
                return jsonify({'error': f'Product with ID {item["id"]} not found'}), 404
            
            if product['quantity'] < item['quantity']:
                return jsonify({'error': f'Insufficient stock for {product["name"]}. Available: {product["quantity"]}, Requested: {item["quantity"]}'}), 400
            
            # Reduce stock
            product['quantity'] -= item['quantity']
        
        # Calculate totals
        subtotal = sum(item['price'] * item['quantity'] for item in items)
        shipping = 0 if subtotal > 500 else 50  # Free shipping above ₹500
        tax = round(subtotal * 0.18)  # 18% GST
        total = subtotal + shipping + tax
        
        # Create order
        order = {
            'id': len(orders) + 1,
            'customerId': customer_id,
            'customerName': customer['name'],
            'items': items,
            'subtotal': subtotal,
            'shipping': shipping,
            'tax': tax,
            'total': total,
            'status': 'pending',
            'date': datetime.now().isoformat(),
            'paymentMethod': data.get('paymentMethod', 'cod'),
            'customerInfo': data.get('customerInfo', {})
        }
        
        orders.append(order)
        
        # Update customer order count and total spent
        customer['orderCount'] += 1
        customer['totalSpent'] += total
        
        # Add to recent orders
        customer['recentOrders'].insert(0, {
            'id': order['id'],
            'date': order['date'][:10],
            'total': total,
            'status': order['status']
        })
        
        # Keep only last 5 recent orders
        customer['recentOrders'] = customer['recentOrders'][:5]
        
        return jsonify(order), 201
    
    except Exception as e:
        print(f"Error creating order: {str(e)}")  # Add debugging
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    for order in orders:
        if order['id'] == order_id:
            order.update(data)
            return jsonify(order)
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/<int:order_id>')
@login_required
def get_order_details(order_id):
    # Find the order
    order = None
    for o in orders:
        if o['id'] == order_id:
            order = o.copy()
            break
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Find the customer
    customer = None
    for c in customers:
        if c['id'] == order['customerId']:
            customer = c
            break
    
    # Add product details to order items
    order_items_with_details = []
    for item in order['items']:
        product = None
        for p in products:
            if p['id'] == item['id']:
                product = p
                break
        
        if product:
            order_items_with_details.append({
                **item,
                'image': product.get('image', ''),
                'brand': product.get('brand', ''),
                'category': product.get('category', ''),
                'sku': product.get('sku', '')
            })
        else:
            order_items_with_details.append(item)
    
    # Create detailed order response
    order_details = {
        **order,
        'items': order_items_with_details,
        'customer': customer
    }
    
    return jsonify(order_details)

@app.route('/api/search-ai', methods=['POST'])
@login_required
def ai_search_products():
    data = request.get_json()
    query = data.get('query', '').lower()
    
    # Parse natural language query using dummy logic
    filters = parse_natural_language_query(query)
    
    # Apply filters to products
    filtered_products = filter_products(products, filters)
    
    return jsonify({
        'products': filtered_products,
        'query': query,
        'filters_applied': filters,
        'total_results': len(filtered_products)
    })

def parse_natural_language_query(query):
    """Parse natural language query and extract filters"""
    filters = {
        'brand': None,
        'category': None,
        'min_price': None,
        'max_price': None,
        'keywords': []
    }
    
    # Extract brand names
    brands = ['apple', 'samsung', 'dell', 'sony', 'microsoft', 'hp', 'lenovo', 'asus', 'acer']
    for brand in brands:
        if brand in query:
            filters['brand'] = brand.title()
            break
    
    # Extract categories
    categories = ['laptop', 'laptops', 'phone', 'phones', 'smartphone', 'smartphones', 'tablet', 'tablets', 
                  'earphone', 'earphones', 'headphone', 'headphones', 'watch', 'watches', 'audio', 'wearable', 'wearables']
    for category in categories:
        if category in query:
            if category.endswith('s'):
                filters['category'] = category[:-1].title() + 's'
            else:
                filters['category'] = category.title()
            break
    
    # Extract price filters for Indian Rupees
    import re
    
    # Look for "under ₹X" or "below ₹X" or "under X" (assuming INR)
    under_match = re.search(r'under\s+₹?(\d+)', query)
    if under_match:
        filters['max_price'] = float(under_match.group(1))
    
    # Look for "above ₹X" or "over ₹X" or "above X" (assuming INR)
    above_match = re.search(r'(?:above|over)\s+₹?(\d+)', query)
    if above_match:
        filters['min_price'] = float(above_match.group(1))
    
    # Look for "between ₹X and ₹Y" or "between X and Y" (assuming INR)
    between_match = re.search(r'between\s+₹?(\d+)\s+and\s+₹?(\d+)', query)
    if between_match:
        filters['min_price'] = float(between_match.group(1))
        filters['max_price'] = float(between_match.group(2))
    
    # Extract keywords (words that might be product features)
    keywords = ['bluetooth', 'wireless', 'pro', 'air', 'galaxy', 'iphone', 'macbook', 'xps', 'airpods']
    for keyword in keywords:
        if keyword in query:
            filters['keywords'].append(keyword)
    
    return filters

def filter_products(products, filters):
    """Apply filters to products list"""
    filtered = []
    
    for product in products:
        # Check brand filter
        if filters['brand'] and product.get('brand', '').lower() != filters['brand'].lower():
            continue
        
        # Check category filter
        if filters['category'] and filters['category'].lower() not in product.get('category', '').lower():
            continue
        
        # Check price filters
        price = product.get('price', 0)
        if filters['min_price'] and price < filters['min_price']:
            continue
        if filters['max_price'] and price > filters['max_price']:
            continue
        
        # Check keywords
        if filters['keywords']:
            product_text = f"{product.get('name', '')} {product.get('brand', '')} {product.get('category', '')}".lower()
            keyword_match = any(keyword in product_text for keyword in filters['keywords'])
            if not keyword_match:
                continue
        
        filtered.append(product)
    
    return filtered

# Bulk Product Upload & Download Endpoints
@app.route('/api/products/bulk-upload', methods=['POST'])
@login_required
def bulk_upload_products():
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Read file based on extension
        if file.filename.endswith('.csv'):
            # Read CSV
            content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            # Read Excel
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel file.'}), 400
        
        # Validate required columns
        required_columns = ['name', 'sku', 'brand', 'price', 'quantity', 'supplier', 'category']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400
        
        # Process each row
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Validate data
                if pd.isna(row['name']) or pd.isna(row['sku']) or pd.isna(row['price']) or pd.isna(row['quantity']):
                    errors.append(f"Row {index + 1}: Missing required fields")
                    error_count += 1
                    continue
                
                # Check if SKU already exists
                existing_sku = any(p['sku'] == str(row['sku']) for p in products)
                if existing_sku:
                    errors.append(f"Row {index + 1}: SKU '{row['sku']}' already exists")
                    error_count += 1
                    continue
                
                # Create new product
                new_product = {
                    'id': max(p['id'] for p in products) + 1,
                    'name': str(row['name']),
                    'sku': str(row['sku']),
                    'brand': str(row['brand']) if not pd.isna(row['brand']) else '',
                    'price': int(float(row['price'])),  # Convert to integer (INR)
                    'quantity': int(float(row['quantity'])),
                    'supplier': str(row['supplier']) if not pd.isna(row['supplier']) else '',
                    'category': str(row['category']) if not pd.isna(row['category']) else '',
                    'image': str(row['image']) if 'image' in df.columns and not pd.isna(row['image']) else 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
                }
                
                products.append(new_product)
                success_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                error_count += 1
        
        return jsonify({
            'message': f'Bulk upload completed. {success_count} products added, {error_count} errors.',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/products/download-csv')
@login_required
def download_products_csv():
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['id', 'name', 'sku', 'brand', 'price', 'quantity', 'supplier', 'category', 'image'])
        
        # Write product data
        for product in products:
            writer.writerow([
                product['id'],
                product['name'],
                product['sku'],
                product['brand'],
                product['price'],
                product['quantity'],
                product['supplier'],
                product['category'],
                product.get('image', '')
            ])
        
        # Create response
        output.seek(0)
        csv_data = output.getvalue()
        
        from flask import Response
        response = Response(csv_data, mimetype='text/csv')
        response.headers['Content-Disposition'] = f'attachment; filename=products_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error generating CSV: {str(e)}'}), 500

# Barcode & QR Code Endpoints
@app.route('/api/products/<int:product_id>/qr-code')
@login_required
def generate_product_qr_code(product_id):
    """Generate QR code for a product"""
    # Find the product
    product = None
    for p in products:
        if p['id'] == product_id:
            product = p
            break
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        # Create QR code data
        qr_data = {
            'id': product['id'],
            'name': product['name'],
            'sku': product['sku'],
            'price': product['price'],
            'url': f'http://localhost:8000/products/{product_id}'
        }
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        # Create QR code image
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'qr_code': f'data:image/png;base64,{qr_base64}',
            'product': product,
            'qr_data': qr_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating QR code: {str(e)}'}), 500

@app.route('/api/products/scan/<sku>')
@login_required
def scan_product_by_sku(sku):
    """Scan product by SKU (simulates barcode scanning)"""
    # Find product by SKU
    product = None
    for p in products:
        if p['sku'].lower() == sku.lower():
            product = p
            break
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'product': product,
        'message': 'Product found successfully'
    })

# Returns Management Endpoints
@app.route('/api/returns')
@login_required
def get_returns():
    """Get all returns (admin) or customer's returns (customer)"""
    if session['role'] == 'admin':
        return jsonify(returns)
    else:
        # For customers, return only their returns
        customer_id = session.get('customerId', 1)
        customer_returns = [r for r in returns if r['customerId'] == customer_id]
        return jsonify(customer_returns)

@app.route('/api/returns', methods=['POST'])
@login_required
def create_return():
    """Create a new return request"""
    data = request.get_json()
    
    # Find the order
    order = None
    for o in orders:
        if o['id'] == data['orderId']:
            order = o
            break
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Check if order belongs to customer (for customer role)
    if session['role'] == 'customer':
        customer_id = session.get('customerId', 1)
        if order['customerId'] != customer_id:
            return jsonify({'error': 'Unauthorized'}), 403
    
    # Create return request
    new_return = {
        'id': len(returns) + 1,
        'orderId': data['orderId'],
        'customerId': order['customerId'],
        'customerName': next((c['name'] for c in customers if c['id'] == order['customerId']), 'Unknown'),
        'items': data['items'],
        'total': sum(item['price'] * item['quantity'] for item in data['items']),
        'status': 'pending',
        'reason': data['reason'],
        'requestDate': datetime.now().isoformat(),
        'processedDate': None,
        'refundNotes': None
    }
    
    returns.append(new_return)
    return jsonify(new_return), 201

@app.route('/api/returns/<int:return_id>', methods=['PUT'])
@login_required
def update_return(return_id):
    """Update return status (admin only)"""
    if session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Find the return
    return_request = None
    for r in returns:
        if r['id'] == return_id:
            return_request = r
            break
    
    if not return_request:
        return jsonify({'error': 'Return request not found'}), 404
    
    # If status is being updated to 'approved', increase product quantities
    if 'status' in data and data['status'] == 'approved' and return_request['status'] != 'approved':
        for item in return_request['items']:
            product = next((p for p in products if p['id'] == item['id']), None)
            if product:
                product['quantity'] += item['quantity']
    
    # Update return
    return_request.update(data)
    if 'status' in data:
        return_request['processedDate'] = datetime.now().isoformat()
    
    return jsonify(return_request)

@app.route('/api/returns/<int:return_id>')
@login_required
def get_return_details(return_id):
    # Find the return
    return_item = next((r for r in returns if r['id'] == return_id), None)
    
    if not return_item:
        return jsonify({'error': 'Return not found'}), 404
    
    # Check if user has permission to view this return
    if session.get('role') == 'customer':
        customer_id = users[session.get('user')].get('customerId')
        if return_item['customerId'] != customer_id:
            return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(return_item)

# Customer Profile Management
@app.route('/api/customer/update', methods=['PUT'])
@login_required
def update_customer_profile():
    if session.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        data = request.get_json()
        customer_id = users[session.get('user')].get('customerId')
        
        # Find the customer
        customer = next((c for c in customers if c['id'] == customer_id), None)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        # Update customer information
        customer['name'] = data.get('name', customer['name'])
        customer['email'] = data.get('email', customer['email'])
        customer['phone'] = data.get('phone', customer['phone'])
        customer['address'] = data.get('address', customer['address'])
        
        return jsonify({'message': 'Profile updated successfully', 'customer': customer})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customer/change-password', methods=['POST'])
@login_required
def change_customer_password():
    if session.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password are required'}), 400
        
        # Validate current password
        username = session.get('user')
        user = users.get(username)
        if not user or not check_password_hash(user['password'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        # Update password
        user['password'] = generate_password_hash(new_password)
        
        return jsonify({'message': 'Password changed successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting server on port 8000...")
    print("Open http://localhost:8000 in your browser")
    app.run(host='0.0.0.0', port=8000, debug=True) 