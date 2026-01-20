import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get site settings (public route)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        freeDeliveryThreshold: 50000,
        deliveryCharge: 500,
        globalDiscount: 0,
        discountType: 'percentage'
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (Admin only)
// Update site settings (Admin only)
import { authenticateAdmin } from '../middleware/auth.js';

router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { freeDeliveryThreshold, deliveryCharge, globalDiscount, discountType, philosophy } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.freeDeliveryThreshold = freeDeliveryThreshold;
    settings.deliveryCharge = deliveryCharge;
    settings.globalDiscount = globalDiscount;
    settings.discountType = discountType;
    if (philosophy) {
      settings.philosophy = philosophy;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Calculate discounted price
router.post('/calculate-price', async (req, res) => {
  try {
    const { originalPrice, quantity = 1 } = req.body;
    const settings = await Settings.findOne();

    if (!settings) {
      return res.json({
        originalPrice,
        discountedPrice: originalPrice,
        discount: 0,
        savings: 0
      });
    }

    let discountedPrice = originalPrice;
    let savings = 0;

    if (settings.globalDiscount > 0) {
      if (settings.discountType === 'percentage') {
        savings = (originalPrice * settings.globalDiscount / 100);
        discountedPrice = originalPrice - savings;
      } else {
        savings = Math.min(settings.globalDiscount, originalPrice);
        discountedPrice = Math.max(0, originalPrice - settings.globalDiscount);
      }
    }

    const totalOriginal = originalPrice * quantity;
    const totalDiscounted = discountedPrice * quantity;
    const totalSavings = savings * quantity;

    res.json({
      originalPrice,
      discountedPrice: Math.round(discountedPrice),
      discount: settings.globalDiscount,
      discountType: settings.discountType,
      savings: Math.round(savings),
      quantity,
      totalOriginal,
      totalDiscounted: Math.round(totalDiscounted),
      totalSavings: Math.round(totalSavings)
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

// Calculate delivery charges
router.post('/calculate-delivery', async (req, res) => {
  try {
    const { cartTotal } = req.body;
    const settings = await Settings.findOne();

    if (!settings) {
      return res.json({
        deliveryCharge: 500,
        isFreeDelivery: false,
        freeDeliveryThreshold: 50000
      });
    }

    const isFreeDelivery = cartTotal >= settings.freeDeliveryThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : settings.deliveryCharge;
    const amountNeededForFree = isFreeDelivery ? 0 : settings.freeDeliveryThreshold - cartTotal;

    res.json({
      deliveryCharge,
      isFreeDelivery,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      amountNeededForFree: Math.max(0, amountNeededForFree),
      finalTotal: cartTotal + deliveryCharge
    });
  } catch (error) {
    console.error('Calculate delivery error:', error);
    res.status(500).json({ error: 'Failed to calculate delivery' });
  }
});

export default router;