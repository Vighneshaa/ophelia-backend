const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Shipping: calculated on backend only (not sent from client). Stored in DB.
const SHIPPING_FREE_MIN = parseFloat(process.env.SHIPPING_FREE_MIN) || 500;
const SHIPPING_FLAT_FEE = parseFloat(process.env.SHIPPING_FLAT_FEE) || 50;

function calculateShippingCost(subtotal) {
  if (subtotal >= SHIPPING_FREE_MIN) return 0;
  return Math.round(SHIPPING_FLAT_FEE * 100) / 100;
}

/** Map order doc to API response (optional populate) */
function toOrderResponse(doc) {
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id.toString(),
    orderNumber: d.orderNumber,
    userId: d.user ? d.user.toString() : null,
    items: d.items,
    shippingAddress: d.shippingAddress,
    paymentInfo: d.paymentInfo,
    orderStatus: d.orderStatus,
    subtotal: d.subtotal,
    shippingCost: d.shippingCost,
    tax: d.tax,
    total: d.total,
    notes: d.notes,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  };
}

// GET /api/orders - Get all orders (admin) or user's orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders.map((o) => ({ ...toOrderResponse(o), _id: o._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images').lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(toOrderResponse(order));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// POST /api/orders - Create new order (prices calculated on backend from current product prices)
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Resolve each item: fetch product and use current price (do not trust client price)
    const orderItems = [];
    for (const item of items) {
      const productId = item.productId;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${productId}` });
      }
      if (!product.inStock) {
        return res.status(400).json({ message: `Product no longer in stock: ${product.name}` });
      }
      orderItems.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    const subtotal = Math.round(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
    const shippingCost = calculateShippingCost(subtotal);
    const taxRate = 0.1;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `OP-${timestamp.slice(-6)}${random}`;

    const orderDoc = {
      orderNumber,
      user: null,
      items: orderItems,
      shippingAddress: {
        firstName: shippingAddress?.firstName ?? '',
        lastName: shippingAddress?.lastName ?? '',
        email: shippingAddress?.email ?? '',
        phone: shippingAddress?.phone ?? '',
        street: shippingAddress?.street ?? '',
        city: shippingAddress?.city ?? '',
        state: shippingAddress?.state ?? '',
        zipCode: shippingAddress?.zipCode ?? '',
        country: shippingAddress?.country ?? ''
      },
      paymentInfo: {
        method: paymentInfo?.method ?? 'cod',
        status: 'pending'
      },
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      notes: notes || ''
    };

    const order = await Order.create(orderDoc);

    res.status(201).json({
      message: 'Order created successfully',
      order: toOrderResponse(order),
      orderNumber: order.orderNumber
    });
  } catch (error) {
    console.error('Order create error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order: toOrderResponse(order) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

module.exports = router;
