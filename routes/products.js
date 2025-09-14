const express = require('express');
const router = express.Router();

// Mock data for now (will be replaced with database later)
let products = [
  {
    id: '1',
    name: 'Vanilla Dreams Candle',
    description: 'A luxurious vanilla-scented candle that fills your space with warmth and comfort. Made with premium soy wax and natural vanilla extract.',
    price: 24.99,
    originalPrice: 29.99,
    category: 'scented',
    images: [
      {
        url: '/api/placeholder/400/400',
        alt: 'Vanilla Dreams Candle'
      }
    ],
    inStock: true,
    stockQuantity: 15,
    featured: true,
    specifications: {
      burnTime: '40-45 hours',
      size: '3.5" x 4"',
      weight: '10 oz',
      scent: 'Vanilla',
      waxType: 'Soy Wax'
    },
    tags: ['vanilla', 'relaxing', 'bedroom'],
    rating: {
      average: 4.8,
      count: 24
    }
  },
  {
    id: '2',
    name: 'Ocean Breeze Candle',
    description: 'Transport yourself to the seaside with this refreshing ocean-inspired candle. Features notes of sea salt, driftwood, and fresh ocean air.',
    price: 22.99,
    originalPrice: 26.99,
    category: 'scented',
    images: [
      {
        url: '/api/placeholder/400/400',
        alt: 'Ocean Breeze Candle'
      }
    ],
    inStock: true,
    stockQuantity: 8,
    featured: true,
    specifications: {
      burnTime: '35-40 hours',
      size: '3.5" x 4"',
      weight: '10 oz',
      scent: 'Ocean Breeze',
      waxType: 'Soy Wax'
    },
    tags: ['ocean', 'fresh', 'living room'],
    rating: {
      average: 4.6,
      count: 18
    }
  },
  {
    id: '3',
    name: 'Lavender Serenity Candle',
    description: 'Unwind and relax with the calming scent of pure lavender. Perfect for meditation, yoga, or a peaceful evening at home.',
    price: 26.99,
    category: 'aromatherapy',
    images: [
      {
        url: '/api/placeholder/400/400',
        alt: 'Lavender Serenity Candle'
      }
    ],
    inStock: true,
    stockQuantity: 12,
    featured: false,
    specifications: {
      burnTime: '45-50 hours',
      size: '3.5" x 4.5"',
      weight: '12 oz',
      scent: 'Lavender',
      waxType: 'Soy Wax'
    },
    tags: ['lavender', 'relaxing', 'aromatherapy'],
    rating: {
      average: 4.9,
      count: 31
    }
  },
  {
    id: '4',
    name: 'Cinnamon Spice Candle',
    description: 'Warm up your home with the cozy scent of cinnamon and spices. Perfect for fall and winter seasons.',
    price: 23.99,
    category: 'seasonal',
    images: [
      {
        url: '/api/placeholder/400/400',
        alt: 'Cinnamon Spice Candle'
      }
    ],
    inStock: true,
    stockQuantity: 20,
    featured: false,
    specifications: {
      burnTime: '38-42 hours',
      size: '3.5" x 4"',
      weight: '10 oz',
      scent: 'Cinnamon Spice',
      waxType: 'Soy Wax'
    },
    tags: ['cinnamon', 'spice', 'cozy', 'winter'],
    rating: {
      average: 4.7,
      count: 15
    }
  }
];

// GET /api/products - Get all products with filtering and pagination
router.get('/', (req, res) => {
  try {
    const { 
      category, 
      featured, 
      inStock, 
      minPrice, 
      maxPrice, 
      search, 
      page = 1, 
      limit = 12,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    let filteredProducts = [...products];

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (featured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.featured === (featured === 'true'));
    }

    if (inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === (inStock === 'true'));
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'rating') {
        aValue = a.rating.average;
        bValue = b.rating.average;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProducts.length / parseInt(limit)),
        totalProducts: filteredProducts.length,
        hasNext: endIndex < filteredProducts.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', (req, res) => {
  try {
    const featuredProducts = products.filter(p => p.featured && p.inStock);
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error: error.message });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', (req, res) => {
  try {
    const newProduct = {
      id: (products.length + 1).toString(),
      ...req.body,
      rating: { average: 0, count: 0 }
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products[productIndex] = { ...products[productIndex], ...req.body };
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
