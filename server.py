from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import os
import json
from datetime import datetime, timedelta
import functools

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
        'role': 'customer'
    }
}

# Sample products data
products = [
    {
        'id': 1,
        'name': 'iPhone 15 Pro',
        'sku': 'IPH15PRO-128',
        'brand': 'Apple',
        'price': 999.99,
        'quantity': 25,
        'supplier': 'Apple Inc.',
        'category': 'Smartphones'
    },
    {
        'id': 2,
        'name': 'Samsung Galaxy S24',
        'sku': 'SAMS24-256',
        'brand': 'Samsung',
        'price': 899.99,
        'quantity': 18,
        'supplier': 'Samsung Electronics',
        'category': 'Smartphones'
    },
    {
        'id': 3,
        'name': 'MacBook Pro 14"',
        'sku': 'MBP14-M2',
        'brand': 'Apple',
        'price': 1999.99,
        'quantity': 12,
        'supplier': 'Apple Inc.',
        'category': 'Laptops'
    },
    {
        'id': 4,
        'name': 'Dell XPS 13',
        'sku': 'DELLXPS13-512',
        'brand': 'Dell',
        'price': 1299.99,
        'quantity': 15,
        'supplier': 'Dell Technologies',
        'category': 'Laptops'
    },
    {
        'id': 5,
        'name': 'AirPods Pro',
        'sku': 'AIRPODS-PRO',
        'brand': 'Apple',
        'price': 249.99,
        'quantity': 50,
        'supplier': 'Apple Inc.',
        'category': 'Audio'
    },
    {
        'id': 6,
        'name': 'Sony WH-1000XM5',
        'sku': 'SONY-WH1000XM5',
        'brand': 'Sony',
        'price': 399.99,
        'quantity': 30,
        'supplier': 'Sony Corporation',
        'category': 'Audio'
    },
    {
        'id': 7,
        'name': 'iPad Air',
        'sku': 'IPAD-AIR-256',
        'brand': 'Apple',
        'price': 699.99,
        'quantity': 22,
        'supplier': 'Apple Inc.',
        'category': 'Tablets'
    },
    {
        'id': 8,
        'name': 'Samsung Galaxy Tab S9',
        'sku': 'SAMS9-128',
        'brand': 'Samsung',
        'price': 649.99,
        'quantity': 16,
        'supplier': 'Samsung Electronics',
        'category': 'Tablets'
    },
    {
        'id': 9,
        'name': 'Apple Watch Series 9',
        'sku': 'AWATCH-S9-45',
        'brand': 'Apple',
        'price': 399.99,
        'quantity': 35,
        'supplier': 'Apple Inc.',
        'category': 'Wearables'
    },
    {
        'id': 10,
        'name': 'Samsung Galaxy Watch 6',
        'sku': 'SAMSGW6-44',
        'brand': 'Samsung',
        'price': 349.99,
        'quantity': 28,
        'supplier': 'Samsung Electronics',
        'category': 'Wearables'
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
        'totalSpent': 2499.97,
        'recentOrders': [
            {'id': 1, 'date': '2024-01-15', 'total': 999.99, 'status': 'completed'},
            {'id': 2, 'date': '2024-02-20', 'total': 249.99, 'status': 'completed'},
            {'id': 3, 'date': '2024-03-10', 'total': 1249.99, 'status': 'pending'}
        ]
    },
    {
        'id': 2,
        'name': 'Sarah Johnson',
        'email': 'sarah.j@email.com',
        'phone': '+1-555-0456',
        'address': '456 Oak Ave, Los Angeles, CA 90210',
        'orderCount': 2,
        'totalSpent': 1649.98,
        'recentOrders': [
            {'id': 4, 'date': '2024-02-05', 'total': 899.99, 'status': 'completed'},
            {'id': 5, 'date': '2024-03-15', 'total': 749.99, 'status': 'shipped'}
        ]
    },
    {
        'id': 3,
        'name': 'Mike Davis',
        'email': 'mike.davis@email.com',
        'phone': '+1-555-0789',
        'address': '789 Pine Rd, Chicago, IL 60601',
        'orderCount': 1,
        'totalSpent': 1999.99,
        'recentOrders': [
            {'id': 6, 'date': '2024-03-01', 'total': 1999.99, 'status': 'completed'}
        ]
    },
    {
        'id': 4,
        'name': 'Emily Wilson',
        'email': 'emily.w@email.com',
        'phone': '+1-555-0321',
        'address': '321 Elm St, Miami, FL 33101',
        'orderCount': 4,
        'totalSpent': 1899.96,
        'recentOrders': [
            {'id': 7, 'date': '2024-01-20', 'total': 399.99, 'status': 'completed'},
            {'id': 8, 'date': '2024-02-10', 'total': 649.99, 'status': 'completed'},
            {'id': 9, 'date': '2024-03-05', 'total': 349.99, 'status': 'completed'},
            {'id': 10, 'date': '2024-03-20', 'total': 499.99, 'status': 'pending'}
        ]
    },
    {
        'id': 5,
        'name': 'David Brown',
        'email': 'david.brown@email.com',
        'phone': '+1-555-0654',
        'address': '654 Maple Dr, Seattle, WA 98101',
        'orderCount': 2,
        'totalSpent': 1299.98,
        'recentOrders': [
            {'id': 11, 'date': '2024-02-15', 'total': 1299.99, 'status': 'completed'},
            {'id': 12, 'date': '2024-03-12', 'total': 249.99, 'status': 'shipped'}
        ]
    }
]

# Sample orders data
orders = [
    {
        'id': 1,
        'customerId': 1,
        'items': [
            {'id': 1, 'name': 'iPhone 15 Pro', 'price': 999.99, 'quantity': 1}
        ],
        'total': 999.99,
        'status': 'completed',
        'date': '2024-01-15T10:30:00'
    },
    {
        'id': 2,
        'customerId': 1,
        'items': [
            {'id': 5, 'name': 'AirPods Pro', 'price': 249.99, 'quantity': 1}
        ],
        'total': 249.99,
        'status': 'completed',
        'date': '2024-02-20T14:15:00'
    },
    {
        'id': 3,
        'customerId': 1,
        'items': [
            {'id': 3, 'name': 'MacBook Pro 14"', 'price': 1999.99, 'quantity': 1}
        ],
        'total': 1999.99,
        'status': 'pending',
        'date': '2024-03-10T09:45:00'
    },
    {
        'id': 4,
        'customerId': 2,
        'items': [
            {'id': 2, 'name': 'Samsung Galaxy S24', 'price': 899.99, 'quantity': 1}
        ],
        'total': 899.99,
        'status': 'completed',
        'date': '2024-02-05T16:20:00'
    },
    {
        'id': 5,
        'customerId': 2,
        'items': [
            {'id': 7, 'name': 'iPad Air', 'price': 699.99, 'quantity': 1},
            {'id': 5, 'name': 'AirPods Pro', 'price': 249.99, 'quantity': 1}
        ],
        'total': 949.98,
        'status': 'shipped',
        'date': '2024-03-15T11:30:00'
    },
    {
        'id': 6,
        'customerId': 3,
        'items': [
            {'id': 3, 'name': 'MacBook Pro 14"', 'price': 1999.99, 'quantity': 1}
        ],
        'total': 1999.99,
        'status': 'completed',
        'date': '2024-03-01T13:00:00'
    },
    {
        'id': 7,
        'customerId': 4,
        'items': [
            {'id': 6, 'name': 'Sony WH-1000XM5', 'price': 399.99, 'quantity': 1}
        ],
        'total': 399.99,
        'status': 'completed',
        'date': '2024-01-20T15:45:00'
    },
    {
        'id': 8,
        'customerId': 4,
        'items': [
            {'id': 8, 'name': 'Samsung Galaxy Tab S9', 'price': 649.99, 'quantity': 1}
        ],
        'total': 649.99,
        'status': 'completed',
        'date': '2024-02-10T10:15:00'
    },
    {
        'id': 9,
        'customerId': 4,
        'items': [
            {'id': 10, 'name': 'Samsung Galaxy Watch 6', 'price': 349.99, 'quantity': 1}
        ],
        'total': 349.99,
        'status': 'completed',
        'date': '2024-03-05T12:30:00'
    },
    {
        'id': 10,
        'customerId': 4,
        'items': [
            {'id': 9, 'name': 'Apple Watch Series 9', 'price': 399.99, 'quantity': 1},
            {'id': 5, 'name': 'AirPods Pro', 'price': 249.99, 'quantity': 1}
        ],
        'total': 649.98,
        'status': 'pending',
        'date': '2024-03-20T14:00:00'
    },
    {
        'id': 11,
        'customerId': 5,
        'items': [
            {'id': 4, 'name': 'Dell XPS 13', 'price': 1299.99, 'quantity': 1}
        ],
        'total': 1299.99,
        'status': 'completed',
        'date': '2024-02-15T09:00:00'
    },
    {
        'id': 12,
        'customerId': 5,
        'items': [
            {'id': 5, 'name': 'AirPods Pro', 'price': 249.99, 'quantity': 1}
        ],
        'total': 249.99,
        'status': 'shipped',
        'date': '2024-03-12T16:45:00'
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

# API Routes
@app.route('/api/dashboard')
@login_required
def get_dashboard_stats():
    total_products = len(products)
    low_stock = sum(1 for p in products if p.get('quantity', 0) < 10)
    total_value = sum(p.get('price', 0) * p.get('quantity', 0) for p in products)
    
    return jsonify({
        'totalProducts': total_products,
        'lowStock': low_stock,
        'totalValue': total_value
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

@app.route('/api/orders')
@login_required
def get_orders():
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    order = {
        'id': len(orders) + 1,
        'customerId': data['customerId'],
        'items': data['items'],
        'total': sum(item['price'] * item['quantity'] for item in data['items']),
        'status': 'pending',
        'date': datetime.now().isoformat()
    }
    orders.append(order)
    
    # Update customer stats
    for customer in customers:
        if customer['id'] == data['customerId']:
            customer['orderCount'] += 1
            customer['totalSpent'] += order['total']
            customer['recentOrders'].append({
                'id': order['id'],
                'date': order['date'],
                'total': order['total'],
                'status': order['status']
            })
            break
    
    return jsonify(order), 201

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

if __name__ == '__main__':
    print("Starting server on port 8000...")
    print("Open http://localhost:8000 in your browser")
    app.run(host='0.0.0.0', port=8000, debug=True) 