import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || AuthUtils.getToken();
      if (!token) {
        handleLogout();
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Only logout on token expiry, not other errors
      if (error.response?.status === 401 && 
          error.response?.data?.error === 'Token expired') {
        console.log('Token expired, logging out');
        handleLogout();
      } else {
        console.log('Network/server error, keeping admin logged in');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || AuthUtils.getToken();
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      
      // Special handling for cancellation
      if (newStatus === 'Cancelled') {
        const confirmCancel = confirm('Are you sure you want to cancel this order? This will refund the payment and restore inventory.');
        if (!confirmCancel) return;
      }
      
      await axios.put(`${API_BASE_URL}/admin/orders/${orderId}`, 
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadAllOrders();
      
      if (newStatus === 'Cancelled') {
        alert('Order cancelled successfully. Payment refunded and inventory restored.');
      } else {
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Update order status error:', error);
      alert('Failed to update order status: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token') || AuthUtils.getToken();
      if (!token) {
        alert('Session expired. Please login again.');
        handleLogout();
        return;
      }
      
      await axios.delete(`${API_BASE_URL}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAllOrders();
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Delete order error:', error);
      if (error.response?.status === 401 && 
          error.response?.data?.error === 'Token expired') {
        alert('Session expired. Please login again.');
        handleLogout();
      } else {
        alert('Failed to delete order: ' + (error.response?.data?.error || 'Network error'));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
    alert('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Order Management</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => loadAllOrders()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Orders
            </button>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="text-accent hover:underline"
            >
              Back to Dashboard
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Order Statistics */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.orderStatus === 'Placed').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Shipped Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.orderStatus === 'Shipped').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">₹{orders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Orders ({orders.length})</h2>
            <div className="flex items-center space-x-4">
              <select className="border rounded px-3 py-1 text-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="border rounded px-3 py-1 text-sm"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items & Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package className="w-12 h-12 text-gray-300 mb-2" />
                          <p>No orders found</p>
                          <p className="text-sm">Orders will appear here when customers place them</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-sm">#{order.trackingNumber}</div>
                            <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-sm">{order.user?.firstName} {order.user?.lastName}</div>
                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                            <div className="text-xs text-gray-500">{order.user?.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-sm">{order.items?.length || 0} items</div>
                            <div className="font-bold text-accent">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.paymentMethod === 'cod' || order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {order.paymentMethod === 'cod' || order.paymentMethod === 'COD' ? 'COD' : 'Card'}
                            </span>
                            <div className={`text-xs mt-1 px-2 py-1 rounded ${
                              order.paymentStatus === 'Refunded' ? 'bg-orange-100 text-orange-800' :
                              order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus || 'Pending'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`text-sm border rounded px-2 py-1 ${
                              order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-800' :
                              order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-800' :
                              order.orderStatus === 'Processing' ? 'bg-orange-50 text-orange-800' :
                              'bg-yellow-50 text-yellow-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => navigate(`/admin/orders/${order._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this order?')) {
                                  deleteOrder(order._id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;