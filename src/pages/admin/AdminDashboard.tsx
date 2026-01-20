import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

// Define interfaces for better type safety
interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  images: { url: string }[];
  isActive: boolean;
}

interface Order {
  _id: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  returnRequest?: {
    isRequested: boolean;
    status: string;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadAllOrders();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = AuthUtils.getToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      // Only logout on specific auth errors, not network/server errors
      if (error.response?.status === 401 &&
        (error.response?.data?.error === 'Invalid token' ||
          error.response?.data?.error === 'Access denied')) {
        handleLogout();
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllOrders = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      // Only logout on specific auth errors, not network/server errors
      if (error.response?.status === 401 &&
        (error.response?.data?.error === 'Invalid token' ||
          error.response?.data?.error === 'Access denied')) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    AuthUtils.clearAuth();
    navigate('/admin/login');
    alert('Logged out successfully');
  };

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const token = AuthUtils.getToken();
        if (!token) {
          alert('Session expired. Please login again.');
          navigate('/admin/login');
          return;
        }

        await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        loadProducts();
        alert('Product deleted successfully!');
      } catch (error: any) {
        console.error('Delete product error:', error);
        alert('Failed to delete product: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90"
            >
              Manage Products
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Orders ({orders.filter(o => o.orderStatus === 'Placed').length})
            </button>
            <button
              onClick={() => navigate('/admin/coupons')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Coupons
            </button>
            <button
              onClick={() => navigate('/admin/testimonials')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Testimonials
            </button>
            <button
              onClick={() => navigate('/admin/messages')}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            >
              Messages
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Return Requests ({orders.filter(o => o.returnRequest?.isRequested && o.returnRequest?.status === 'pending').length})
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Settings
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              📊 Analytics
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-accent">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-orange-600">{orders.filter(o => o.orderStatus === 'Placed').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Pending Returns</h3>
            <p className="text-3xl font-bold text-red-600">{orders.filter(o => o.returnRequest?.isRequested && o.returnRequest?.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Revenue Today</h3>
            <p className="text-3xl font-bold text-green-600">₹{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90"
              >
                Add New Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="w-10 h-10 rounded object-cover" src={product.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={product.title} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`${product.stock < 5 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => navigate('/admin/products')}
                        className="text-accent hover:text-accent/70"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;