const express = require('express');
const router = express.Router();

// Mock data for categories
let categories = [
  {
    id: '1',
    name: 'Scented Candles',
    description: 'Beautiful candles with amazing fragrances to enhance your mood and atmosphere.',
    slug: 'scented',
    image: {
      url: '/api/placeholder/300/200',
      alt: 'Scented Candles Collection'
    },
    isActive: true,
    sortOrder: 1
  },
  {
    id: '2',
    name: 'Aromatherapy',
    description: 'Therapeutic candles designed to promote relaxation and well-being.',
    slug: 'aromatherapy',
    image: {
      url: '/api/placeholder/300/200',
      alt: 'Aromatherapy Candles'
    },
    isActive: true,
    sortOrder: 2
  },
  {
    id: '3',
    name: 'Seasonal Collection',
    description: 'Special candles for holidays and seasonal celebrations.',
    slug: 'seasonal',
    image: {
      url: '/api/placeholder/300/200',
      alt: 'Seasonal Candles'
    },
    isActive: true,
    sortOrder: 3
  },
  {
    id: '4',
    name: 'Luxury Collection',
    description: 'Premium handcrafted candles made with the finest materials.',
    slug: 'luxury',
    image: {
      url: '/api/placeholder/300/200',
      alt: 'Luxury Candles'
    },
    isActive: true,
    sortOrder: 4
  },
  {
    id: '5',
    name: 'Unscented',
    description: 'Pure, clean-burning candles without fragrance.',
    slug: 'unscented',
    image: {
      url: '/api/placeholder/300/200',
      alt: 'Unscented Candles'
    },
    isActive: true,
    sortOrder: 5
  }
];

// GET /api/categories - Get all categories
router.get('/', (req, res) => {
  try {
    const { active } = req.query;
    
    let filteredCategories = [...categories];
    
    if (active !== undefined) {
      filteredCategories = filteredCategories.filter(c => c.isActive === (active === 'true'));
    }
    
    // Sort by sortOrder
    filteredCategories.sort((a, b) => a.sortOrder - b.sortOrder);
    
    res.json(filteredCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/categories/:id - Get single category by ID
router.get('/:id', (req, res) => {
  try {
    const category = categories.find(c => c.id === req.params.id || c.slug === req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// POST /api/categories - Create new category (admin only)
router.post('/', (req, res) => {
  try {
    const newCategory = {
      id: (categories.length + 1).toString(),
      ...req.body,
      slug: req.body.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
    };
    
    categories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', (req, res) => {
  try {
    const categoryIndex = categories.findIndex(c => c.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    }
    
    categories[categoryIndex] = { ...categories[categoryIndex], ...req.body };
    res.json(categories[categoryIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', (req, res) => {
  try {
    const categoryIndex = categories.findIndex(c => c.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    categories.splice(categoryIndex, 1);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;
