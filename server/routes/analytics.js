import express from 'express';
import jwt from 'jsonwebtoken';
import analyticsService from '../services/analyticsService.js';

const router = express.Router();

const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId === 'admin') {
      req.admin = { id: 'admin', role: 'admin' };
      next();
    } else {
      res.status(401).json({ error: 'Admin access required' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/financial', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getFinancialOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getSalesAnalysis();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/category', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getCategoryPerformance();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getCustomerInsights();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/growth', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getGrowthMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inventory', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getInventoryStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const data = await analyticsService.getOrderStatusBreakdown();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health-score', adminAuth, async (req, res) => {
  try {
    const score = await analyticsService.getBusinessHealthScore();
    res.json({ healthScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/comprehensive', adminAuth, async (req, res) => {
  try {
    const report = await analyticsService.getComprehensiveReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
