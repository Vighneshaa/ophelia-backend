# Ophelia Candles Backend API

A Node.js/Express backend API for the Ophelia Candles e-commerce website.

## Features

- RESTful API endpoints for products, categories, orders, and authentication
- MongoDB connection (Atlas or local); runs without DB if `MONGODB_URI` is not set
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

3. Create a `.env` file (copy from `.env.example`) and set:
   - `MONGODB_URI` – your MongoDB connection string (e.g. MongoDB Atlas)
   - Optionally `PORT` (default 3001) and `FRONTEND_URL`

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`. On startup you should see `MongoDB connected` if `MONGODB_URI` is set.

**Create collections and seed data (categories + products):**

MongoDB has no "tables"—it uses **collections**, which are created automatically when you first insert documents. To create the `categories` and `products` collections and fill them with initial data, run:

```bash
npm run seed
```

This drops existing categories/products in the `ophelia` database and inserts 3 categories and 10 products (same as the in-memory mock). Run it once after connecting to a new database, or anytime you want to reset that data.

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
- `GET /api/orders` - List all orders (stored in MongoDB)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order (saves to MongoDB)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Health Check
- `GET /api/health` - API health check

## Development

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Next Steps

1. ~~Integrate with MongoDB database~~ (products, categories, orders stored in MongoDB)
2. Add proper password hashing
3. Implement file upload for product images
4. Admin dashboard to view orders (GET /api/orders)
5. Implement payment processing
6. Add comprehensive testing
