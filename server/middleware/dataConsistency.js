import dataConsistencyService from '../services/dataConsistencyService.js';

export const ensureDataConsistency = async (req, res, next) => {
  try {
    await dataConsistencyService.ensureDataConsistency();
    next();
  } catch (error) {
    console.error('Data consistency middleware error:', error);
    res.status(500).json({ error: 'Data consistency check failed' });
  }
};

export const validateProductData = (req, res, next) => {
  const { title, price, category, stock } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Product title is required' });
  }
  
  if (price === undefined || price < 0) {
    return res.status(400).json({ error: 'Valid product price is required' });
  }
  
  if (!category || !['Living', 'Dining', 'Bedroom', 'Office', 'Decor'].includes(category)) {
    return res.status(400).json({ error: 'Valid product category is required' });
  }
  
  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: 'Valid product stock is required' });
  }
  
  next();
};
