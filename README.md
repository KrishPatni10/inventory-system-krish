# Inventory Management System

A complete inventory management system with Flask backend and modern web interface. Features admin and customer dashboards with full CRUD operations, reporting, and e-commerce functionality.

## Features

### Admin Dashboard
- **Dashboard Overview**: Real-time statistics and analytics
- **Product Management**: Add, edit, delete products with categories
- **Customer Management**: View and manage customer accounts
- **Order Management**: Track and process customer orders
- **Reports & Analytics**: Interactive charts and data export
- **Settings**: System configuration and user preferences

### Customer Dashboard
- **Product Catalog**: Browse products with search and filtering
- **Shopping Cart**: Add/remove items, quantity management
- **Order History**: View past orders and status
- **Profile Management**: Update personal information
- **Checkout System**: Complete purchase process

## Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Extract the zip file** to your desired location
2. **Open terminal/command prompt** in the project directory
3. **Create a virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application**:
   ```bash
   python server.py
   ```

6. **Open your browser** and go to: `http://localhost:8000`

## Default Login Credentials

### Admin Access
- **Username**: admin
- **Password**: admin123

### Customer Access
- **Username**: customer
- **Password**: customer123

## Project Structure

```
inventory-system/
├── server.py              # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── frontend/             # Frontend files
│   ├── pages/           # HTML templates
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript files
├── backend/              # Backend code
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── schemas/         # Data schemas
└── inventory.db         # SQLite database (created automatically)
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/<id>` - Update product
- `DELETE /api/products/<id>` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer

## Database

The system uses SQLite database (`inventory.db`) which is created automatically on first run. The database includes:

- **Products**: Product catalog with categories
- **Customers**: User accounts and profiles
- **Orders**: Order history and status
- **Users**: Admin and customer accounts

## Customization

### Adding New Products
1. Login as admin
2. Go to Products section
3. Click "Add Product"
4. Fill in product details
5. Save

### Modifying Categories
Edit the category list in `frontend/js/admin-dashboard.js` under the `getProductImage` function.

### Styling
Modify CSS files in `frontend/css/` to customize the appearance.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change port in `server.py` line 590
   - Or kill the process using the port

2. **Database errors**
   - Delete `inventory.db` file
   - Restart the application

3. **Missing dependencies**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

4. **Static files not loading**
   - Check if all frontend files are present
   - Verify file permissions

### Error Logs
Check the terminal output for detailed error messages when running the server.

## Development

### Adding New Features
1. Backend: Add routes in `backend/routes/`
2. Frontend: Add JavaScript in `frontend/js/`
3. Styling: Update CSS in `frontend/css/`

### Database Schema
The database schema is defined in `backend/models/`. To modify:
1. Update model files
2. Delete existing `inventory.db`
3. Restart application

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regular database backups recommended

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in terminal
3. Verify all files are present and intact

## License

This project is for educational and personal use.

---

**Happy Inventory Managing! 🚀** 