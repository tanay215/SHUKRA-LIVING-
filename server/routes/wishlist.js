import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'title price originalPrice images category rating stock isActive',
        match: { isActive: true }
      });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
      await wishlist.save();
    }

    // Filter out inactive products
    wishlist.items = wishlist.items.filter(item => item.product);

    // Calculate price changes
    const itemsWithPriceChange = wishlist.items.map(item => {
      const currentPrice = item.product.price;
      const addedPrice = item.priceWhenAdded;
      const priceChange = currentPrice - addedPrice;
      const priceChangePercent = addedPrice > 0 ? 
        Math.round((priceChange / addedPrice) * 100) : 0;

      return {
        ...item.toObject(),
        priceChange,
        priceChangePercent,
        isPriceDropped: priceChange < 0,
        isPriceIncreased: priceChange > 0
      };
    });

    res.json({
      wishlist: {
        ...wishlist.toObject(),
        items: itemsWithPriceChange
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add item to wishlist
router.post('/add', authenticate, sanitizeInput, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    }).select('price');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add item
    wishlist.addItem(productId, product.price);
    await wishlist.save();

    res.json({ 
      message: 'Product added to wishlist',
      itemCount: wishlist.itemCount
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const initialCount = wishlist.items.length;
    wishlist.removeItem(productId);

    if (wishlist.items.length === initialCount) {
      return res.status(404).json({ error: 'Product not in wishlist' });
    }

    await wishlist.save();

    res.json({ 
      message: 'Product removed from wishlist',
      itemCount: wishlist.itemCount
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.json({ isInWishlist });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
});

// Clear entire wishlist
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared' });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

// Get wishlist count
router.get('/count', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const count = wishlist ? wishlist.itemCount : 0;

    res.json({ count });

  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({ error: 'Failed to get wishlist count' });
  }
});

export default router;