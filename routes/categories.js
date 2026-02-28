const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');

function toCategoryResponse(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    slug: doc.slug,
    image: doc.image || { url: '', alt: '' },
    isActive: doc.isActive !== false,
    sortOrder: doc.sortOrder ?? 0
  };
}

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const docs = await Category.find(filter).sort({ sortOrder: 1 }).lean();
    res.json(docs.map(toCategoryResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/categories/:id - Get single category by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isObjId = mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;
    const doc = await Category.findOne(isObjId ? { _id: id } : { slug: id }).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(toCategoryResponse(doc));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// POST /api/categories - Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    const doc = await Category.create(req.body);
    res.status(201).json(toCategoryResponse(doc));
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    const doc = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(toCategoryResponse(doc));
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Category.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;
