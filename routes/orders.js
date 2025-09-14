const express = require('express');
const router = express.Router();

// Mock orders data
let orders = [];

// GET /api/orders - Get all orders (admin) or user's orders
router.get('/', (req, res) => {
  try {
    // In a real app, you would authenticate and filter by user
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentInfo,
      subtotal,
      shippingCost = 0,
      tax = 0
    } = req.body;

    // Calculate total
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `OP-${timestamp.slice(-6)}${random}`;

    const newOrder = {
      id: (orders.length + 1).toString(),
      orderNumber,
      userId: '1', // In real app, get from authenticated user
      items,
      shippingAddress,
      paymentInfo: {
        ...paymentInfo,
        status: 'pending'
      },
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    orders[orderIndex].orderStatus = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      message: 'Order status updated successfully',
      order: orders[orderIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

module.exports = router;
