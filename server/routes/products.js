import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import emergencyDataRecovery from '../services/emergencyDataRecovery.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('Getting all products...');
    
    const { 
      category, search, minPrice, maxPrice, material, color, inStock, rating,
      sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 
    } = req.query;

    const filter = { isActive: true };
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

    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);
    
    console.log(`Found ${products.length} products`);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      filters: {
        categories: await Product.distinct('category', { isActive: true }),
        materials: (await Product.distinct('specifications.material', { isActive: true })).filter(m => m),
        colors: (await Product.distinct('specifications.color', { isActive: true })).filter(c => c)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log('Getting product with ID:', req.params.id);
    
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      console.log('Product not found:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product found:', product.title);

    // Get reviews for this product from orders
    const reviews = await Order.find({
      'items.product': req.params.id,
      'rating.isRated': true,
      isHidden: { $ne: true }
    })
    .populate('user', 'firstName lastName')
    .select('rating user createdAt')
    .sort({ 'rating.ratedAt': -1 })
    .limit(10)
    .lean();

    console.log('Found reviews:', reviews.length);

    // Format reviews
    const formattedReviews = reviews.map(order => ({
      _id: order._id,
      user: {
        firstName: order.user?.firstName || 'Anonymous',
        lastName: order.user?.lastName || 'User'
      },
      rating: order.rating.rating,
      feedback: order.rating.feedback || '',
      createdAt: order.rating.ratedAt || order.createdAt
    }));

    product.reviews = formattedReviews;
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.reviews.push({
      user: req.user?._id,
      rating,
      comment
    });

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
