import NodeCache from 'node-cache';

// Cache instances
const productCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const userCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
const searchCache = new NodeCache({ stdTTL: 180 }); // 3 minutes

// Cache middleware factory
export const cacheMiddleware = (cacheInstance, keyGenerator, ttl) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const cached = cacheInstance.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data) {
      if (res.statusCode === 200) {
        cacheInstance.set(key, data, ttl);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Product cache middleware
export const cacheProducts = cacheMiddleware(
  productCache,
  (req) => `products_${JSON.stringify(req.query)}`,
  300
);

export const cacheProduct = cacheMiddleware(
  productCache,
  (req) => `product_${req.params.id}`,
  300
);

// User cache middleware
export const cacheUser = cacheMiddleware(
  userCache,
  (req) => `user_${req.user.id}`,
  600
);

// Search cache middleware
export const cacheSearch = cacheMiddleware(
  searchCache,
  (req) => `search_${req.query.q}_${req.query.category || 'all'}`,
  180
);

// Cache invalidation helpers
export const invalidateProductCache = (productId) => {
  productCache.del(`product_${productId}`);
  // Clear all product list caches
  productCache.keys().forEach(key => {
    if (key.startsWith('products_')) {
      productCache.del(key);
    }
  });
};

export const invalidateUserCache = (userId) => {
  userCache.del(`user_${userId}`);
};

export const invalidateSearchCache = () => {
  searchCache.flushAll();
};

// Cache statistics
export const getCacheStats = () => {
  return {
    products: productCache.getStats(),
    users: userCache.getStats(),
    search: searchCache.getStats()
  };
};