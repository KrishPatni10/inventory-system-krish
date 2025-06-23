#!/usr/bin/env python3
"""
Database Initialization Script
Creates the SQLite database with sample data for the inventory system.
"""

import sqlite3
import os
from datetime import datetime, timedelta

def create_database():
    """Create the SQLite database with tables and sample data."""
    
    # Remove existing database if it exists
    if os.path.exists('inventory.db'):
        os.remove('inventory.db')
    
    # Create new database
    conn = sqlite3.connect('inventory.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            role TEXT NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            category TEXT,
            brand TEXT,
            sku TEXT UNIQUE,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            items TEXT,  -- JSON string of order items
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers (id)
        )
    ''')
    
    # Insert sample users
    users_data = [
        ('admin', 'admin123', 'admin@inventory.com', 'admin'),
        ('customer', 'customer123', 'customer@example.com', 'customer'),
        ('john_doe', 'password123', 'john@example.com', 'customer'),
        ('jane_smith', 'password123', 'jane@example.com', 'customer')
    ]
    
    cursor.executemany('''
        INSERT INTO users (username, password, email, role)
        VALUES (?, ?, ?, ?)
    ''', users_data)
    
    # Insert sample products
    products_data = [
        ('iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 50, 'Smartphones', 'Apple', 'IPH15PRO', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'),
        ('MacBook Air M2', 'Powerful laptop for professionals', 1299.99, 30, 'Laptops', 'Apple', 'MBAIRM2', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'),
        ('Sony WH-1000XM5', 'Premium noise-canceling headphones', 349.99, 75, 'Audio', 'Sony', 'SONYWH5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'),
        ('iPad Air', 'Versatile tablet for work and play', 599.99, 40, 'Tablets', 'Apple', 'IPADAIR', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'),
        ('Apple Watch Series 9', 'Smartwatch with health features', 399.99, 60, 'Wearables', 'Apple', 'AWATCH9', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'),
        ('Samsung Galaxy S24', 'Android flagship smartphone', 899.99, 45, 'Smartphones', 'Samsung', 'SAMS24', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'),
        ('Dell XPS 13', 'Ultrabook for productivity', 1199.99, 25, 'Laptops', 'Dell', 'DELLXPS13', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'),
        ('Bose QuietComfort 45', 'Comfortable noise-canceling headphones', 329.99, 55, 'Audio', 'Bose', 'BOSEQC45', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'),
        ('Samsung Galaxy Tab S9', 'Premium Android tablet', 649.99, 35, 'Tablets', 'Samsung', 'SAMS9TAB', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'),
        ('Fitbit Versa 4', 'Fitness tracking smartwatch', 229.99, 80, 'Wearables', 'Fitbit', 'FITBITV4', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop')
    ]
    
    cursor.executemany('''
        INSERT INTO products (name, description, price, quantity, category, brand, sku, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', products_data)
    
    # Insert sample customers
    customers_data = [
        ('John Doe', 'john@example.com', '+1-555-0101', '123 Main St, City, State 12345'),
        ('Jane Smith', 'jane@example.com', '+1-555-0102', '456 Oak Ave, City, State 12345'),
        ('Mike Johnson', 'mike@example.com', '+1-555-0103', '789 Pine Rd, City, State 12345'),
        ('Sarah Wilson', 'sarah@example.com', '+1-555-0104', '321 Elm St, City, State 12345'),
        ('David Brown', 'david@example.com', '+1-555-0105', '654 Maple Dr, City, State 12345')
    ]
    
    cursor.executemany('''
        INSERT INTO customers (name, email, phone, address)
        VALUES (?, ?, ?, ?)
    ''', customers_data)
    
    # Insert sample orders
    orders_data = [
        (1, 1349.98, 'completed', '[{"product_id": 1, "quantity": 1, "price": 999.99}, {"product_id": 3, "quantity": 1, "price": 349.99}]'),
        (2, 599.99, 'processing', '[{"product_id": 4, "quantity": 1, "price": 599.99}]'),
        (3, 399.99, 'shipped', '[{"product_id": 5, "quantity": 1, "price": 399.99}]'),
        (4, 1299.99, 'completed', '[{"product_id": 2, "quantity": 1, "price": 1299.99}]'),
        (5, 899.99, 'pending', '[{"product_id": 6, "quantity": 1, "price": 899.99}]')
    ]
    
    cursor.executemany('''
        INSERT INTO orders (customer_id, total_amount, status, items)
        VALUES (?, ?, ?, ?)
    ''', orders_data)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("✅ Database created successfully!")
    print("📊 Sample data inserted:")
    print("   - 4 users (admin, customer, john_doe, jane_smith)")
    print("   - 10 products across 5 categories")
    print("   - 5 customers")
    print("   - 5 sample orders")
    print("\n🚀 You can now run 'python server.py' to start the application!")

if __name__ == "__main__":
    create_database() 