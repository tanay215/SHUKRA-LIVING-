import express from 'express';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';
import dataConsistencyService from '../services/dataConsistencyService.js';

const router = express.Router();

// Get all products with consistency check
router.get('/', async (req, res) => {
  try {
    const { 
      category, search, minPrice, maxPrice, material, color, inStock, rating,
      sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 
    } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (material) filter['specifications.material'] = new RegExp(material, 'i');
    if (color) filter['specifications.color'] = new RegExp(color, 'i');
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (rating) filter['rating.average'] = { $gte: Number(rating) };
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { 'specifications.material': new RegExp(search, 'i') },
        { 'specifications.color': new RegExp(search, 'i') }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const result = await dataConsistencyService.getProductsWithConsistencyCheck(filter, {
      page: Number(page),
      limit: Number(limit),
      sort
    });

    const categories = await Product.distinct('category', { isActive: true });
    const materials = await Product.distinct('specifications.material', { isActive: true });
    const colors = await Product.distinct('specifications.color', { isActive: true });

    res.json({
      products: result.products,
      pagination: result.pagination,
      filters: {
        categories,
        materials: materials.filter(m => m),
        colors: colors.filter(c => c)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product with consistency check
router.get('/:id', async (req, res) => {
  try {
    const product = await dataConsistencyService.getProductByIdWithConsistencyCheck(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add product review
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});



export default router;