/**
 * Seed script: creates MongoDB collections and inserts initial categories + products.
 * Run: node scripts/seed.js   (from ophelia-backend directory, with .env set)
 *
 * MongoDB creates collections automatically on first insert; there are no "tables" to create.
 * This script inserts the same data as the in-memory mock so you can switch routes to DB later.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

const CATEGORIES = [
  { name: 'Regular Candles', slug: 'regular', description: '', sortOrder: 0 },
  { name: 'Festive Collection', slug: 'festive', description: '', sortOrder: 1 },
  { name: 'Bottle Candles', slug: 'bottle', description: '', sortOrder: 2 }
];

// Mock products (categoryId '1'|'2'|'3', will be replaced with Category ObjectIds)
const PRODUCTS = [
  { id: 1, name: "Vanilla Dreams", price: 24.99, originalPrice: 29.99, categoryId: "1", description: "A warm, comforting blend of vanilla and cream", longDescription: "Indulge in the luxurious aroma of our Vanilla Dreams candle. Hand-poured with the finest natural soy wax and premium vanilla extract, this candle creates an atmosphere of pure comfort and relaxation. Perfect for unwinding after a long day or creating a cozy ambiance in any room.", images: ["/instagram-images/2025-09-15_DOnsGJeDDGz.jpg", "/instagram-images/2025-09-11_DOdfnCGDOQT.jpg", "/instagram-images/2025-08-30_DN-sRfzDCoZ.jpg"], features: ["100% Natural Soy Wax", "Premium Cotton Wick", "50+ Hour Burn Time", "Hand-poured in Small Batches", "Eco-friendly Packaging"], specifications: { burnTime: "50+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.8, reviews: 127, tags: ["vanilla", "cream", "comfort", "relaxation"], relatedProducts: [2, 3, 8], featured: true },
  { id: 2, name: "Lavender Fields", price: 22.99, categoryId: "1", description: "Fresh lavender with hints of bergamot", longDescription: "Transport yourself to a serene lavender field with this beautifully crafted candle. The delicate blend of French lavender and bergamot creates a calming atmosphere that promotes relaxation and peaceful sleep. Perfect for bedrooms, meditation spaces, or any area where you seek tranquility.", images: ["/instagram-images/2025-08-28_DN5dNwRDHwA.jpg", "/instagram-images/2025-08-24_DNvJYh5WKLV.jpg", "/instagram-images/2025-08-18_DNfjppEsXfI.jpg"], features: ["French Lavender Essential Oil", "Bergamot Accent Notes", "45+ Hour Burn Time", "Aromatherapy Benefits", "Sustainably Sourced"], specifications: { burnTime: "45+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.9, reviews: 89, tags: ["lavender", "bergamot", "relaxation", "sleep"], relatedProducts: [1, 3, 9], featured: true },
  { id: 3, name: "Sandalwood Serenity", price: 26.99, categoryId: "1", description: "Rich sandalwood with warm amber notes", longDescription: "Experience the deep, grounding essence of sandalwood combined with warm amber undertones. This sophisticated blend creates an atmosphere of meditation and mindfulness, perfect for yoga studios, home offices, or any space where you seek focus and inner peace.", images: ["/instagram-images/2025-08-05_DM-QBs4s4eG.jpg", "/instagram-images/2025-06-28_DLcXGOpRyg8.jpg", "/instagram-images/2025-06-21_DLKVT4csRgj.jpg"], features: ["Premium Sandalwood Oil", "Warm Amber Base Notes", "55+ Hour Burn Time", "Meditation & Focus", "Luxury Gift Box"], specifications: { burnTime: "55+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.7, reviews: 156, tags: ["sandalwood", "amber", "meditation", "focus"], relatedProducts: [1, 2, 10], featured: true },
  { id: 4, name: "Holiday Spice", price: 28.99, categoryId: "2", description: "Warm cinnamon and clove with hints of orange", longDescription: "Celebrate the season with our signature Holiday Spice candle. The perfect blend of warming cinnamon, aromatic clove, and zesty orange creates the quintessential holiday atmosphere. This limited-edition candle brings the magic of the holidays to your home year-round.", images: ["/instagram-images/2025-06-18_DLCnKS3sh_f.jpg", "/instagram-images/2025-06-08_DKo5Wlfskwu.jpg", "/instagram-images/2025-09-15_DOnsGJeDDGz.jpg"], features: ["Seasonal Spice Blend", "Limited Edition", "60+ Hour Burn Time", "Holiday Gift Ready", "Festive Packaging"], specifications: { burnTime: "60+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.9, reviews: 203, tags: ["cinnamon", "clove", "orange", "holiday", "seasonal"], relatedProducts: [5, 6, 1], featured: true },
  { id: 5, name: "Winter Wonderland", price: 26.99, categoryId: "2", description: "Fresh pine and crisp winter air", longDescription: "Capture the essence of a winter forest with our Winter Wonderland candle. The crisp, clean scent of fresh pine needles and cool winter air creates an invigorating atmosphere that brings the beauty of nature indoors during the coldest months.", images: ["/instagram-images/2025-09-11_DOdfnCGDOQT.jpg", "/instagram-images/2025-08-30_DN-sRfzDCoZ.jpg", "/instagram-images/2025-08-28_DN5dNwRDHwA.jpg"], features: ["Fresh Pine Essential Oil", "Crisp Winter Notes", "50+ Hour Burn Time", "Seasonal Collection", "Nature-Inspired"], specifications: { burnTime: "50+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.6, reviews: 78, tags: ["pine", "winter", "fresh", "nature"], relatedProducts: [4, 6, 2], featured: true },
  { id: 6, name: "Gingerbread Dreams", price: 24.99, categoryId: "2", description: "Sweet ginger and molasses with vanilla", longDescription: "Indulge in the sweet, spicy aroma of freshly baked gingerbread. This warm, comforting blend of ginger, molasses, and vanilla creates the perfect holiday atmosphere. It's like having a gingerbread house in candle form!", images: ["/instagram-images/2025-08-24_DNvJYh5WKLV.jpg", "/instagram-images/2025-08-18_DNfjppEsXfI.jpg", "/instagram-images/2025-08-05_DM-QBs4s4eG.jpg"], features: ["Ginger & Molasses Blend", "Vanilla Accent", "45+ Hour Burn Time", "Holiday Favorite", "Gift-Ready Packaging"], specifications: { burnTime: "45+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.8, reviews: 134, tags: ["ginger", "molasses", "vanilla", "holiday", "sweet"], relatedProducts: [4, 5, 1], featured: true },
  { id: 7, name: "Ocean Breeze", price: 32.99, categoryId: "3", description: "Fresh sea salt and ocean mist", longDescription: "Escape to the coast with our Ocean Breeze bottle candle. The refreshing blend of sea salt, ocean mist, and marine notes creates a clean, invigorating atmosphere. Housed in an elegant glass bottle, this candle brings the calming essence of the ocean to your space.", images: ["/instagram-images/2025-06-28_DLcXGOpRyg8.jpg", "/instagram-images/2025-06-21_DLKVT4csRgj.jpg", "/instagram-images/2025-06-18_DLCnKS3sh_f.jpg"], features: ["Sea Salt & Marine Notes", "Elegant Glass Bottle", "65+ Hour Burn Time", "Coastal Aesthetic", "Premium Presentation"], specifications: { burnTime: "65+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "4\" x 4\" x 5\"", weight: "12 oz" }, inStock: true, rating: 4.9, reviews: 167, tags: ["ocean", "sea salt", "marine", "fresh", "coastal"], relatedProducts: [8, 9, 3] },
  { id: 8, name: "Rose Garden", price: 34.99, categoryId: "3", description: "Delicate rose petals with green leaves", longDescription: "Step into a blooming rose garden with this exquisite bottle candle. The delicate fragrance of fresh rose petals combined with green leaf notes creates a romantic, floral atmosphere. Perfect for special occasions, date nights, or creating a luxurious spa-like experience at home.", images: ["/instagram-images/2025-06-08_DKo5Wlfskwu.jpg", "/instagram-images/2025-09-15_DOnsGJeDDGz.jpg", "/instagram-images/2025-09-11_DOdfnCGDOQT.jpg"], features: ["Fresh Rose Petals", "Green Leaf Accents", "70+ Hour Burn Time", "Romantic Atmosphere", "Luxury Gift Box"], specifications: { burnTime: "70+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "4\" x 4\" x 5\"", weight: "12 oz" }, inStock: true, rating: 4.8, reviews: 145, tags: ["rose", "floral", "romantic", "luxury", "gift"], relatedProducts: [7, 9, 2] },
  { id: 9, name: "Citrus Burst", price: 30.99, categoryId: "3", description: "Bright lemon and grapefruit zest", longDescription: "Energize your space with the vibrant, uplifting scent of fresh citrus. This bright blend of lemon and grapefruit zest creates an invigorating atmosphere perfect for morning routines, home offices, or any time you need a burst of energy and positivity.", images: ["/instagram-images/2025-08-30_DN-sRfzDCoZ.jpg", "/instagram-images/2025-08-28_DN5dNwRDHwA.jpg", "/instagram-images/2025-08-24_DNvJYh5WKLV.jpg"], features: ["Fresh Citrus Blend", "Energizing Aroma", "60+ Hour Burn Time", "Morning Routine", "Uplifting Mood"], specifications: { burnTime: "60+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "4\" x 4\" x 5\"", weight: "12 oz" }, inStock: true, rating: 4.7, reviews: 98, tags: ["citrus", "lemon", "grapefruit", "energizing", "fresh"], relatedProducts: [7, 8, 1] },
  { id: 10, name: "Eucalyptus Mint", price: 29.99, categoryId: "1", description: "Refreshing eucalyptus with cool mint", longDescription: "Breathe deeply with our refreshing Eucalyptus Mint candle. The cooling blend of eucalyptus and mint creates a spa-like atmosphere that promotes relaxation and clear breathing. Perfect for bathrooms, meditation spaces, or any area where you seek a fresh, clean environment.", images: ["/instagram-images/2025-08-18_DNfjppEsXfI.jpg", "/instagram-images/2025-08-05_DM-QBs4s4eG.jpg", "/instagram-images/2025-06-28_DLcXGOpRyg8.jpg"], features: ["Eucalyptus Essential Oil", "Cool Mint Notes", "50+ Hour Burn Time", "Spa-Like Experience", "Aromatherapy Benefits"], specifications: { burnTime: "50+ hours", wax: "100% Natural Soy Wax", wick: "Premium Cotton Wick", dimensions: "3.5\" x 3.5\" x 4\"", weight: "8 oz" }, inStock: true, rating: 4.6, reviews: 112, tags: ["eucalyptus", "mint", "spa", "refreshing", "clean"], relatedProducts: [1, 2, 3] }
];

const slugByCategoryId = { '1': 'regular', '2': 'festive', '3': 'bottle' };

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  await connectDB();

  console.log('Dropping existing categories and products...');
  await Category.deleteMany({});
  await Product.deleteMany({});

  console.log('Inserting categories...');
  const insertedCategories = await Category.insertMany(CATEGORIES);
  const slugToId = {};
  insertedCategories.forEach((c) => { slugToId[c.slug] = c._id; });

  console.log('Inserting products...');
  const productDocs = PRODUCTS.map((p) => {
    const categoryId = slugToId[slugByCategoryId[p.categoryId]];
    return {
      name: p.name,
      description: p.description,
      longDescription: p.longDescription || '',
      features: p.features || [],
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      category: categoryId,
      images: (p.images || []).map((url) => ({ url, alt: '' })),
      inStock: p.inStock !== false,
      featured: p.featured === true,
      tags: p.tags || [],
      rating: { average: p.rating || 0, count: p.reviews || 0 },
      specifications: {
        burnTime: (p.specifications && p.specifications.burnTime) || '',
        dimensions: (p.specifications && p.specifications.dimensions) || '',
        wax: (p.specifications && p.specifications.wax) || '',
        wick: (p.specifications && p.specifications.wick) || '',
        weight: (p.specifications && p.specifications.weight) || ''
      }
    };
  });

  const inserted = await Product.insertMany(productDocs);
  const productIdToObjId = {};
  inserted.forEach((doc, i) => {
    productIdToObjId[PRODUCTS[i].id] = doc._id;
  });

  console.log('Linking related products...');
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    if (!p.relatedProducts || p.relatedProducts.length === 0) continue;
    const relatedObjIds = p.relatedProducts.map((id) => productIdToObjId[id]).filter(Boolean);
    await Product.updateOne({ _id: inserted[i]._id }, { $set: { relatedProducts: relatedObjIds } });
  }

  console.log('✅ Seed done. Categories:', insertedCategories.length, '| Products:', inserted.length);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
