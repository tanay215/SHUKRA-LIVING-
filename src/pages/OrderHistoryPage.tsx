import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';
import ReturnRequestModal from '../components/ReturnRequestModal';
import RatingModal from '../components/RatingModal';

const API_BASE_URL = 'http://localhost:30011/api';

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeOrderFromHistory = async (orderId) => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        alert('Please login again');
        return;
      }
      
      await axios.delete(`${API_BASE_URL}/users/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setOrders(orders.filter(o => o._id !== orderId));
      alert('Order removed from history successfully');
    } catch (error) {
      console.error('Remove order error:', error);
      alert('Failed to remove order: ' + (error.response?.data?.error || error.message));
    }
  };

  const cancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const token = AuthUtils.getToken();
      await axios.put(`${API_BASE_URL}/users/orders/${cancellingOrder._id}/cancel`, {
        reason: cancelReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === cancellingOrder._id 
          ? { ...order, orderStatus: 'Cancelled', cancellationReason: cancelReason }
          : order
      ));
      
      setCancellingOrder(null);
      setCancelReason('');
      alert('Order cancelled successfully');
    } catch (error) {
      alert('Failed to cancel order: ' + (error.response?.data?.error || error.message));
    }
  };

  const openReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnModalOpen(true);
  };

  const openRatingModal = (orderId) => {
    setSelectedOrderId(orderId);
    setRatingModalOpen(true);
  };

  const handleReturnSuccess = () => {
    loadUserOrders(); // Reload orders to show updated return status
  };

  const handleRatingSuccess = () => {
    loadUserOrders(); // Reload orders to show updated rating status
  };

  const canReturn = (order) => {
    // Only delivered orders can be returned
    if (order.orderStatus !== 'Delivered' || order.returnRequest?.isRequested) {
      return false;
    }
    
    // Check if delivered date exists
    if (!order.deliveredAt) {
      return false;
    }
    
    const deliveredDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
    
    // Check if any item in the order is returnable
    return order.items?.some(item => 
      item.product?.returnPolicy?.isReturnable && 
      daysSinceDelivery <= (item.product.returnPolicy.returnDays || 0)
    );
  };

  const canRate = (order) => {
    return order.orderStatus === 'Delivered' && !order.rating?.isRated;
  };

  // For testing purposes, let's also show buttons for non-delivered orders
  const canReturnForTesting = (order) => {
    // Allow return requests for any order that's not cancelled and hasn't been returned yet
    return order.orderStatus !== 'Cancelled' && !order.returnRequest?.isRequested;
  };

  const canRateForTesting = (order) => {
    // Allow rating for any order that hasn't been rated yet
    return !order.rating?.isRated;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Order History</h1>
          <button onClick={() => navigate('/dashboard')} className="text-accent hover:underline">
            Back to Shop
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
            <button onClick={() => navigate('/dashboard')} className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.trackingNumber}</h3>
                    <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'Processing' ? 'bg-orange-100 text-orange-800' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                    {order.cancellationReason && (
                      <div className="text-xs text-red-600 mt-1">
                        Reason: {order.cancellationReason}
                      </div>
                    )}
                    {order.returnRequest?.isRequested && (
                      <div className="text-xs text-orange-600 mt-1">
                        <div>Return Status: {order.returnRequest.status}</div>
                        {order.returnRequest.scheduledPickupDate && (
                          <div>Pickup Date: {new Date(order.returnRequest.scheduledPickupDate).toLocaleDateString('en-IN')} at {new Date(order.returnRequest.scheduledPickupDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        )}
                        {order.returnRequest.refundAmount && (
                          <div>Refund: ₹{order.returnRequest.refundAmount.toLocaleString('en-IN')}</div>
                        )}
                        {order.returnRequest.adminNotes && (
                          <div>Admin Notes: {order.returnRequest.adminNotes}</div>
                        )}
                      </div>
                    )}
                    {order.rating?.isRated && (
                      <div className="text-xs text-green-600 mt-1">
                        Rated: {order.rating.rating}/5 stars
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Items ({order.items?.length || 0}):</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span>{item.product?.title || 'Product'} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2 flex-wrap">
                  <button 
                    onClick={() => navigate(`/order-tracking/${order.trackingNumber}`)}
                    className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/90 text-sm"
                  >
                    Track Order
                  </button>
                  {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                    <button 
                      onClick={() => setCancellingOrder(order)}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                  {canReturnForTesting(order) && (
                    <button 
                      onClick={() => openReturnModal(order._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                    >
                      Return Order
                    </button>
                  )}
                  {canRateForTesting(order) && (
                    <button 
                      onClick={() => openRatingModal(order._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Rate Order
                    </button>
                  )}
                  {(order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') && (
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this order from your history?')) {
                          removeOrderFromHistory(order._id);
                        }
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Order #{cancellingOrder.trackingNumber}</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for cancelling this order:</p>
            
            <div className="space-y-3 mb-4">
              {['Changed my mind', 'Found better price elsewhere', 'Ordered by mistake', 'Delivery taking too long', 'Product no longer needed'].map((reason) => (
                <label key={reason} className="flex items-center">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="cancelReason" 
                  value="other"
                  checked={cancelReason === 'other'}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Other (specify below)</span>
              </label>
            </div>
            
            {cancelReason === 'other' && (
              <textarea
                placeholder="Please specify your reason..."
                value={cancelReason === 'other' ? '' : cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent mb-4"
                rows={3}
              />
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setCancellingOrder(null);
                  setCancelReason('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button 
                onClick={cancelOrder}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      <ReturnRequestModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        orderId={selectedOrderId}
        onSuccess={handleReturnSuccess}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        orderId={selectedOrderId}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
};

export default OrderHistoryPage;