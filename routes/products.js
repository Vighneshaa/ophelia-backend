const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

/** Map product doc (with populated category) to API response shape for frontend */
function toProductResponse(doc) {
  const cat = doc.category;
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    originalPrice: doc.originalPrice,
    categoryId: cat ? cat._id.toString() : '',
    category: cat ? { id: cat._id.toString(), name: cat.name, slug: cat.slug } : null,
    description: doc.description,
    longDescription: doc.longDescription || '',
    images: (doc.images || []).map((i) => (typeof i === 'string' ? i : i.url)),
    features: doc.features || [],
    specifications: {
      burnTime: (doc.specifications && doc.specifications.burnTime) || '',
      wax: (doc.specifications && doc.specifications.wax) || '',
      wick: (doc.specifications && doc.specifications.wick) || '',
      dimensions: (doc.specifications && doc.specifications.dimensions) || '',
      weight: (doc.specifications && doc.specifications.weight) || ''
    },
    inStock: doc.inStock !== false,
    rating: (doc.rating && doc.rating.average) || 0,
    reviews: (doc.rating && doc.rating.count) || 0,
    tags: doc.tags || [],
    relatedProducts: (doc.relatedProducts || []).map((o) => (o._id ? o._id.toString() : o.toString()))
  };
}

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const docs = await Product.find({ featured: true, inStock: true })
      .limit(6)
      .populate('category', 'name slug')
      .lean();
    res.json(docs.map(toProductResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error: error.message });
  }
});

// GET /api/products/category/:categoryId - Get products by category ID or slug
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(categoryId) && String(categoryId).length === 24;
    const category = await Category.findOne(
      isObjectId ? { _id: categoryId } : { slug: categoryId }
    ).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const docs = await Product.find({ category: category._id, inStock: true })
      .populate('category', 'name slug')
      .lean();
    res.json(docs.map(toProductResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

// GET /api/products/:id/related - Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: 'relatedProducts', populate: { path: 'category', select: 'name slug' } })
      .lean();
    if (!product || !product.relatedProducts || product.relatedProducts.length === 0) {
      return res.json([]);
    }
    res.json(product.relatedProducts.map(toProductResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching related products', error: error.message });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id).populate('category', 'name slug').lean();
    if (!doc) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(toProductResponse(doc));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// GET /api/products - Get all products with filtering and pagination
router.get('/', async (req, res) => {
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

    const filter = {};

    if (category) {
      const isObjId = mongoose.Types.ObjectId.isValid(category) && String(category).length === 24;
      const cat = await Category.findOne(isObjId ? { _id: category } : { slug: category }).lean();
      if (cat) filter.category = cat._id;
    }

    if (featured === 'true') filter.featured = true;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice != null) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
      delete sort.rating;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [docs, totalProducts] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limitNum).populate('category', 'name slug').lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      products: docs.map(toProductResponse),
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalProducts / limitNum) || 1,
        totalProducts,
        hasNext: skip + docs.length < totalProducts,
        hasPrev: skip > 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.images && Array.isArray(body.images) && body.images.length > 0 && typeof body.images[0] === 'string') {
      body.images = body.images.map((url) => ({ url, alt: '' }));
    }
    if (!body.rating) body.rating = { average: 0, count: 0 };
    const doc = await Product.create(body);
    const populated = await Product.findById(doc._id).populate('category', 'name slug').lean();
    res.status(201).json(toProductResponse(populated));
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug').lean();
    if (!doc) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(toProductResponse(doc));
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
