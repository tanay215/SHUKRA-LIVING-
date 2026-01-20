import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware for reviews
const validateReviewMiddleware = (req, res, next) => {
  const { rating, title, comment } = req.body;
  const errors = [];

  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  if (!title || title.length < 5 || title.length > 200) {
    errors.push('Title must be between 5 and 200 characters');
  }
  if (!comment || comment.length < 10 || comment.length > 1000) {
    errors.push('Comment must be between 10 and 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

// Get reviews for a product
router.get('/product/:productId', sanitizeInput, async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      rating
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { product: productId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'rating_high':
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case 'rating_low':
        sortOptions = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOptions = { helpful: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [reviews, totalCount, ratingStats] = await Promise.all([
      Review.find(query)
        .populate('user', 'firstName lastName profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ])
    ]);

    // Calculate rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum
      },
      ratingDistribution,
      totalReviews: totalCount
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Add a review
router.post('/', authenticate, sanitizeInput, validateReviewMiddleware, async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      pros = [],
      cons = [],
      wouldRecommend = true
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product (optional verification)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });

    // Create review
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      pros: pros.slice(0, 5), // Limit to 5 pros
      cons: cons.slice(0, 5), // Limit to 5 cons
      wouldRecommend,
      verified: !!hasPurchased
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    // Populate user data for response
    await review.populate('user', 'firstName lastName profileImage');

    res.status(201).json({
      message: 'Review added successfully',
      review
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Update a review
router.put('/:reviewId', authenticate, sanitizeInput, validateReviewMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      rating,
      title,
      comment,
      pros = [],
      cons = [],
      wouldRecommend = true
    } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update review
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    review.pros = pros.slice(0, 5);
    review.cons = cons.slice(0, 5);
    review.wouldRecommend = wouldRecommend;

    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    await review.populate('user', 'firstName lastName profileImage');

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already marked as helpful' });
    }

    review.markHelpful(req.user._id);
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      helpfulCount: review.helpful
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

// Unmark review as helpful
router.delete('/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.unmarkHelpful(req.user._id);
    await review.save();

    res.json({
      message: 'Review unmarked as helpful',
      helpfulCount: review.helpful
    });

  } catch (error) {
    console.error('Unmark helpful error:', error);
    res.status(500).json({ error: 'Failed to unmark review as helpful' });
  }
});

// Get user's reviews
router.get('/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalCount] = await Promise.all([
      Review.find({ user: req.user._id })
        .populate('product', 'title images price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ user: req.user._id })
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await Product.findByIdAndUpdate(productId, {
      'rating.average': averageRating,
      'rating.count': reviews.length
    });

  } catch (error) {
    console.error('Update product rating error:', error);
  }
}



// Get testimonials (public)
router.get('/testimonials/featured', async (req, res) => {
  try {
    const testimonials = await Review.find({ isTestimonial: true })
      .populate('user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Toggle testimonial status (Admin only)
// Toggle testimonial status (Admin only)
import { authenticateAdmin } from '../middleware/auth.js';

router.put('/:reviewId/testimonial', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isTestimonial } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isTestimonial },
      { new: true }
    ).populate('user', 'firstName lastName profileImage');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Toggle testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial status' });
  }
});

// Create manual testimonial (Admin only)
router.post('/testimonials', authenticateAdmin, async (req, res) => {
  try {
    const {
      customerName,
      customerRole,
      rating,
      comment,
      image
    } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ error: 'Name, rating, and comment are required' });
    }

    const review = new Review({
      customerName,
      customerRole: customerRole || 'Customer',
      rating,
      comment,
      title: 'Testimonial', // Default title
      isTestimonial: true,
      verified: false, // Manual testimonials aren't verified orders usually
      images: image ? [{ url: image, alt: customerName }] : []
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Delete testimonial (Admin only)
router.delete('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;