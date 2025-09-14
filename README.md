# Ophelia Candles Backend API

A Node.js/Express backend API for the Ophelia Candles e-commerce website.

## Features

- RESTful API endpoints for products, categories, orders, and authentication
- Mock data for development (ready for database integration)
- JWT-based authentication
- Input validation and error handling
- CORS enabled for frontend integration
- Rate limiting and security middleware

## Installation

1. Navigate to the backend directory:
   ```bash
   cd ophelia-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration (see `.env` for example)

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering, pagination, search)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Health Check
- `GET /api/health` - API health check

## Development

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Next Steps

1. Integrate with MongoDB database
2. Add proper password hashing
3. Implement file upload for product images
4. Add email notifications
5. Implement payment processing
6. Add comprehensive testing
