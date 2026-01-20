import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

class AnalyticsService {
  async getFinancialOverview() {
    try {
      const orders = await Order.find({ paymentStatus: 'Paid' });
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue: Math.round(avgOrderValue),
        totalCustomers: await User.countDocuments(),
        activeProducts: await Product.countDocuments({ isActive: true })
      };
    } catch (error) {
      console.error('Financial overview error:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        activeProducts: 0
      };
    }
  }

  async getSalesAnalysis() {
    try {
      const orders = await Order.find().populate('items.product');
      const productSales = {};

      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (item.product) {
              const productId = item.product._id.toString();
              if (!productSales[productId]) {
                productSales[productId] = {
                  title: item.product.title,
                  quantity: 0,
                  revenue: 0,
                  category: item.product.category
                };
              }
              productSales[productId].quantity += item.quantity || 0;
              productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
            }
          });
        }
      });

      const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

      return {
        bestSelling: sorted.slice(0, 5),
        worstSelling: sorted.slice(-5).reverse(),
        totalOrders: orders.length,
        totalQuantitySold: Object.values(productSales).reduce((sum, p) => sum + p.quantity, 0)
      };
    } catch (error) {
      console.error('Sales analysis error:', error);
      return {
        bestSelling: [],
        worstSelling: [],
        totalOrders: 0,
        totalQuantitySold: 0
      };
    }
  }

  async getCategoryPerformance() {
    try {
      const products = await Product.find({ isActive: true });
      const orders = await Order.find().populate('items.product');
      
      const categoryStats = {};
      
      products.forEach(p => {
        if (!categoryStats[p.category]) {
          categoryStats[p.category] = {
            totalProducts: 0,
            totalStock: 0,
            avgPrice: 0,
            avgRating: 0,
            salesCount: 0,
            revenue: 0
          };
        }
        categoryStats[p.category].totalProducts++;
        categoryStats[p.category].totalStock += p.stock || 0;
        categoryStats[p.category].avgPrice += p.price || 0;
        categoryStats[p.category].avgRating += (p.rating?.average || 0);
      });

      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (item.product && categoryStats[item.product.category]) {
              const cat = item.product.category;
              categoryStats[cat].salesCount++;
              categoryStats[cat].revenue += (item.price || 0) * (item.quantity || 0);
            }
          });
        }
      });

      Object.keys(categoryStats).forEach(cat => {
        const count = categoryStats[cat].totalProducts;
        if (count > 0) {
          categoryStats[cat].avgPrice = Math.round(categoryStats[cat].avgPrice / count);
          categoryStats[cat].avgRating = Math.round((categoryStats[cat].avgRating / count) * 10) / 10;
        }
      });

      return categoryStats;
    } catch (error) {
      console.error('Category performance error:', error);
      return {};
    }
  }

  async getCustomerInsights() {
    try {
      const users = await User.find();
      const orders = await Order.find();
      
      const newCustomers = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate > thirtyDaysAgo;
      }).length;

      const returningCustomers = users.length - newCustomers;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const avgCustomerValue = users.length > 0 ? totalRevenue / users.length : 0;

      return {
        totalCustomers: users.length,
        newCustomers,
        returningCustomers,
        customerRetentionRate: users.length > 0 ? Math.round((returningCustomers / users.length) * 100) : 0,
        averageCustomerLifetimeValue: Math.round(avgCustomerValue),
        averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0
      };
    } catch (error) {
      console.error('Customer insights error:', error);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        averageCustomerLifetimeValue: 0,
        averageOrderValue: 0
      };
    }
  }

  async getGrowthMetrics() {
    try {
      const orders = await Order.find().sort({ createdAt: 1 });
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const currentMonth = orders.filter(o => new Date(o.createdAt) > thirtyDaysAgo);
      const previousMonth = orders.filter(o => new Date(o.createdAt) > sixtyDaysAgo && new Date(o.createdAt) <= thirtyDaysAgo);

      const currentRevenue = currentMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const previousRevenue = previousMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const growthRate = previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0;

      return {
        currentMonthRevenue: currentRevenue,
        previousMonthRevenue: previousRevenue,
        growthRate,
        currentMonthOrders: currentMonth.length,
        previousMonthOrders: previousMonth.length
      };
    } catch (error) {
      console.error('Growth metrics error:', error);
      return {
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        growthRate: 0,
        currentMonthOrders: 0,
        previousMonthOrders: 0
      };
    }
  }

  async getInventoryStatus() {
    try {
      const products = await Product.find({ isActive: true });
      
      const lowStock = products.filter(p => p.stock < 5);
      const overStock = products.filter(p => p.stock > 50);
      const optimalStock = products.filter(p => p.stock >= 5 && p.stock <= 50);

      return {
        totalProducts: products.length,
        lowStockItems: lowStock.length,
        overStockItems: overStock.length,
        optimalStockItems: optimalStock.length,
        lowStockProducts: lowStock.map(p => ({ title: p.title, stock: p.stock, category: p.category })),
        totalInventoryValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
      };
    } catch (error) {
      console.error('Inventory status error:', error);
      return {
        totalProducts: 0,
        lowStockItems: 0,
        overStockItems: 0,
        optimalStockItems: 0,
        lowStockProducts: [],
        totalInventoryValue: 0
      };
    }
  }

  async getOrderStatusBreakdown() {
    try {
      const orders = await Order.find();
      
      const breakdown = {
        placed: orders.filter(o => o.orderStatus === 'Placed').length,
        confirmed: orders.filter(o => o.orderStatus === 'Confirmed').length,
        processing: orders.filter(o => o.orderStatus === 'Processing').length,
        shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
        delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
        cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length
      };

      const paymentBreakdown = {
        pending: orders.filter(o => o.paymentStatus === 'Pending').length,
        paid: orders.filter(o => o.paymentStatus === 'Paid').length,
        failed: orders.filter(o => o.paymentStatus === 'Failed').length,
        refunded: orders.filter(o => o.paymentStatus === 'Refunded').length
      };

      return { orderStatus: breakdown, paymentStatus: paymentBreakdown };
    } catch (error) {
      console.error('Order status breakdown error:', error);
      return {
        orderStatus: {
          placed: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        },
        paymentStatus: {
          pending: 0,
          paid: 0,
          failed: 0,
          refunded: 0
        }
      };
    }
  }

  async getRevenueTrend() {
    try {
      const orders = await Order.find().sort({ createdAt: 1 });
      const trends = {};

      // Group orders by week
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!trends[weekKey]) {
          trends[weekKey] = 0;
        }
        trends[weekKey] += order.totalAmount || 0;
      });

      // Convert to array and sort
      const trendArray = Object.entries(trends)
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue: Math.round(revenue)
        }))
        .slice(-12); // Last 12 weeks

      return trendArray.length > 0 ? trendArray : [];
    } catch (error) {
      console.error('Revenue trend error:', error);
      return [];
    }
  }

  async getTopProducts() {
    try {
      const orders = await Order.find().populate('items.product');
      const productSales = {};

      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (item.product) {
              const productId = item.product._id.toString();
              if (!productSales[productId]) {
                productSales[productId] = {
                  name: item.product.title,
                  sales: 0
                };
              }
              productSales[productId].sales += item.quantity || 0;
            }
          });
        }
      });

      const sorted = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return sorted.length > 0 ? sorted : [];
    } catch (error) {
      console.error('Top products error:', error);
      return [];
    }
  }

  async getBusinessHealthScore() {
    try {
      const financial = await this.getFinancialOverview();
      const sales = await this.getSalesAnalysis();
      const customer = await this.getCustomerInsights();
      const inventory = await this.getInventoryStatus();
      const growth = await this.getGrowthMetrics();

      let score = 50;
      
      if (financial.totalRevenue > 100000) score += 15;
      if (customer.customerRetentionRate > 50) score += 15;
      if (growth.growthRate > 0) score += 10;
      if (inventory.lowStockItems < 5) score += 10;
      if (financial.activeProducts > 10) score += 10;

      return Math.min(100, Math.max(score, 0));
    } catch (error) {
      console.error('Health score error:', error);
      return 0;
    }
  }

  async getComprehensiveReport() {
    try {
      const report = {
        financial: await this.getFinancialOverview(),
        sales: await this.getSalesAnalysis(),
        customer: await this.getCustomerInsights(),
        category: await this.getCategoryPerformance(),
        growth: await this.getGrowthMetrics(),
        inventory: await this.getInventoryStatus(),
        orderStatus: await this.getOrderStatusBreakdown(),
        healthScore: await this.getBusinessHealthScore(),
        revenueTrend: await this.getRevenueTrend(),
        topProducts: await this.getTopProducts(),
        timestamp: new Date().toISOString()
      };

      return report;
    } catch (error) {
      console.error('Comprehensive report error:', error);
      return {
        financial: {},
        sales: {},
        customer: {},
        category: {},
        growth: {},
        inventory: {},
        orderStatus: {},
        healthScore: 0,
        revenueTrend: [],
        topProducts: [],
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new AnalyticsService();
