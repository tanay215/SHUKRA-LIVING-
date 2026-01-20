import express from 'express';
import Product from '../models/Product.js';
import { cacheSearch } from '../middleware/cache.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Advanced search with filters
router.get('/', sanitizeInput, cacheSearch, async (req, res) => {
  try {
    const {
      q = '',
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
      inStock = true
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = { isActive: true };

    // Stock filter
    if (inStock === 'true') {
      searchQuery.stock = { $gt: 0 };
    }

    // Text search
    if (q.trim()) {
      searchQuery.$text = { $search: q.trim() };
    }

    // Category filters
    if (category && category !== 'all') {
      searchQuery.category = category;
    }
    if (subcategory) {
      searchQuery.subcategory = subcategory;
    }

    // Price range
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      searchQuery['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { price: 1 };
        break;
      case 'price_high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { purchasesLastMonth: -1, viewCount: -1 };
        break;
      case 'relevance':
      default:
        if (q.trim()) {
          sortOptions = { score: { $meta: 'textScore' } };
        } else {
          sortOptions = { 'rating.average': -1, purchasesLastMonth: -1 };
        }
        break;
    }

    // Execute search
    const [products, totalCount] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-reviews -__v')
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    // Get facets for filtering
    const facets = await getFacets(q, category);

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      facets,
      searchQuery: {
        query: q,
        category,
        subcategory,
        minPrice,
        maxPrice,
        rating,
        sortBy
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get search suggestions
router.get('/suggestions', sanitizeInput, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          price: 1,
          images: { $slice: ['$images', 1] }
        }
      },
      { $limit: 10 }
    ]);

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get popular searches
router.get('/popular', async (req, res) => {
  try {
    // This would typically come from search analytics
    const popularSearches = [
      'sofa', 'dining table', 'bed', 'chair', 'wardrobe',
      'coffee table', 'bookshelf', 'desk', 'mirror', 'lamp'
    ];

    res.json({ popularSearches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get popular searches' });
  }
});

// Helper function to get search facets
async function getFacets(query, category) {
  try {
    const matchStage = { isActive: true };
    if (query) {
      matchStage.$text = { $search: query };
    }
    if (category && category !== 'all') {
      matchStage.category = category;
    }

    const facets = await Product.aggregate([
      { $match: matchStage },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          subcategories: [
            { $group: { _id: '$subcategory', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 5000, 15000, 30000, 50000, 100000, Infinity],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ],
          ratings: [
            {
              $bucket: {
                groupBy: '$rating.average',
                boundaries: [0, 3, 4, 4.5, 5],
                default: 'Unrated',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    return facets[0];
  } catch (error) {
    console.error('Facets error:', error);
    return {};
  }
}

export default router;