import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUp, ArrowDown, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/analytics/comprehensive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      if (error.response?.status === 401) {
        AuthUtils.clearAuth();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthUtils.clearAuth();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const financial = data?.financial || {};
  const sales = data?.sales || {};
  const customer = data?.customer || {};
  const inventory = data?.inventory || {};
  const growth = data?.growth || {};
  const orderStatus = data?.orderStatus || {};
  const healthScore = data?.healthScore || 0;

  // Prepare chart data
  const orderStatusData = [
    { name: 'Placed', value: orderStatus.orderStatus?.placed || 0 },
    { name: 'Confirmed', value: orderStatus.orderStatus?.confirmed || 0 },
    { name: 'Processing', value: orderStatus.orderStatus?.processing || 0 },
    { name: 'Shipped', value: orderStatus.orderStatus?.shipped || 0 },
    { name: 'Delivered', value: orderStatus.orderStatus?.delivered || 0 },
    { name: 'Cancelled', value: orderStatus.orderStatus?.cancelled || 0 }
  ];

  const paymentStatusData = [
    { name: 'Pending', value: orderStatus.paymentStatus?.pending || 0 },
    { name: 'Paid', value: orderStatus.paymentStatus?.paid || 0 },
    { name: 'Failed', value: orderStatus.paymentStatus?.failed || 0 },
    { name: 'Refunded', value: orderStatus.paymentStatus?.refunded || 0 }
  ];

  const inventoryData = [
    { name: 'Low Stock', value: inventory.lowStockItems || 0, fill: '#EF4444' },
    { name: 'Optimal', value: inventory.optimalStockItems || 0, fill: '#10B981' },
    { name: 'Over Stock', value: inventory.overStockItems || 0, fill: '#F59E0B' }
  ];

  const COLORS = ['#8B4513', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">📊 Advanced Analytics Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAnalytics}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 text-sm"
            >
              Products
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Health Score */}
        <div className="mb-8 bg-gradient-to-r from-accent to-accent/80 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Health Score</h2>
              <p className="opacity-90">Overall business performance indicator</p>
            </div>
            <div className="text-6xl font-bold">{healthScore}%</div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${healthScore}%` }}></div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <DollarSign className="w-8 h-8 text-accent/30" />
            </div>
            <p className="text-3xl font-bold text-accent">₹{(financial.totalRevenue || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-2">{financial.totalOrders || 0} orders</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
              <TrendingUp className="w-8 h-8 text-blue-600/30" />
            </div>
            <p className="text-3xl font-bold text-blue-600">₹{(financial.averageOrderValue || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-2">Per transaction</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">Total Customers</p>
              <Users className="w-8 h-8 text-purple-600/30" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{customer.totalCustomers || 0}</p>
            <p className="text-xs text-gray-500 mt-2">{customer.newCustomers || 0} new this month</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">Active Products</p>
              <ShoppingBag className="w-8 h-8 text-green-600/30" />
            </div>
            <p className="text-3xl font-bold text-green-600">{financial.activeProducts || 0}</p>
            <p className="text-xs text-gray-500 mt-2">{inventory.lowStockItems || 0} low stock</p>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-4">Month-over-Month Growth</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Month</p>
                <p className="text-2xl font-bold text-accent">₹{(growth.currentMonthRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className={`flex items-center gap-1 ${growth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth.growthRate >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                <span className="font-bold text-lg">{Math.abs(growth.growthRate || 0)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-4">Customer Retention</h3>
            <p className="text-3xl font-bold text-blue-600">{customer.customerRetentionRate || 0}%</p>
            <p className="text-sm text-gray-600 mt-2">{customer.returningCustomers || 0} returning customers</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-4">Inventory Value</h3>
            <p className="text-3xl font-bold text-green-600">₹{(inventory.totalInventoryValue || 0).toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600 mt-2">{inventory.totalProducts || 0} products in stock</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8B4513"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B4513" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Top 5 Selling Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(sales.bestSelling || []).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} width={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Products</th>
                    <th className="px-4 py-2 text-right">Avg Price</th>
                    <th className="px-4 py-2 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(data?.category || {}).map(([cat, stats]: any) => (
                    <tr key={cat} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{cat}</td>
                      <td className="px-4 py-2 text-right">{stats.totalProducts}</td>
                      <td className="px-4 py-2 text-right">₹{stats.avgPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-right">⭐ {stats.avgRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              Low Stock Items
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(inventory.lowStockProducts || []).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <div>
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">{product.stock}</span>
                </div>
              ))}
              {(!inventory.lowStockProducts || inventory.lowStockProducts.length === 0) && (
                <div className="flex items-center gap-2 text-green-600 p-3">
                  <CheckCircle size={20} />
                  <span>All products have healthy stock levels</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Customer Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Total Customers</p>
              <p className="text-2xl font-bold text-blue-600">{customer.totalCustomers || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Avg Lifetime Value</p>
              <p className="text-2xl font-bold text-green-600">₹{(customer.averageCustomerLifetimeValue || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">₹{(customer.averageOrderValue || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
