import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, Truck, RotateCcw, Star } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [returnStatus, setReturnStatus] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orderData = response.data;
      setOrder(orderData);
      setNewStatus(orderData.orderStatus);
      setDeliveryDate(orderData.estimatedDelivery ? 
        new Date(orderData.estimatedDelivery).toISOString().slice(0, 16) : '');
      
      // Initialize return management fields
      if (orderData.returnRequest) {
        setReturnStatus(orderData.returnRequest.status || 'pending');
        setPickupDate(orderData.returnRequest.scheduledPickupDate ? 
          new Date(orderData.returnRequest.scheduledPickupDate).toISOString().slice(0, 16) : 
          // Default to tomorrow at 10 AM if no pickup date set
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 11) + '10:00'
        );
        setRefundAmount(orderData.returnRequest.refundAmount || orderData.totalAmount);
        setAdminNotes(orderData.returnRequest.adminNotes || '');
      } else {
        // Set default pickup date for new return requests
        setPickupDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 11) + '10:00');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        alert('Order not found');
        navigate('/admin/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (e) => {
    e?.preventDefault();
    if (!newStatus || newStatus === order.orderStatus) return;
    
    setUpdating(true);
    try {
      const token = AuthUtils.getToken();
      const response = await axios.put(`${API_BASE_URL}/admin/orders/${id}`, 
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with response data
      if (response.data.order) {
        setOrder(response.data.order);
      } else {
        setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update order status error:', error);
      alert('Failed to update order status');
      setNewStatus(order.orderStatus); // Reset to original status
    } finally {
      setUpdating(false);
    }
  };

  const updateDeliveryDate = async (e) => {
    e?.preventDefault();
    if (!deliveryDate) {
      alert('Please select a delivery date');
      return;
    }
    
    setUpdating(true);
    try {
      const token = AuthUtils.getToken();
      console.log('Updating delivery date to:', deliveryDate);
      
      const response = await axios.put(`${API_BASE_URL}/admin/orders/${id}`, 
        { estimatedDelivery: new Date(deliveryDate).toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with response data
      if (response.data.order) {
        setOrder(response.data.order);
        setDeliveryDate(response.data.order.estimatedDelivery ? 
          new Date(response.data.order.estimatedDelivery).toISOString().slice(0, 16) : '');
      } else {
        setOrder(prev => ({ ...prev, estimatedDelivery: deliveryDate }));
      }
      alert('Delivery date updated successfully!');
    } catch (error) {
      console.error('Update delivery date error:', error);
      alert('Failed to update delivery date: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const updateReturnRequest = async () => {
    if (!order.returnRequest?.isRequested) {
      alert('No return request found for this order');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const updateData = {
        status: returnStatus,
        adminNotes: adminNotes.trim()
      };

      if (returnStatus === 'approved' && pickupDate) {
        updateData.scheduledPickupDate = pickupDate;
      }

      if (returnStatus === 'completed' && refundAmount) {
        updateData.refundAmount = parseFloat(refundAmount);
      }

      console.log('Updating return request with data:', updateData);

      await axios.put(`${API_BASE_URL}/admin/returns/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reload order to get updated data
      await loadOrderDetail();
      alert('Return request updated successfully!');
    } catch (error) {
      console.error('Update return request error:', error);
      alert('Failed to update return request: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/orders')} 
              className="text-accent hover:bg-accent/10 p-2 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-heading font-bold text-accent">Order Details</h1>
          </div>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="text-accent hover:underline"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-semibold">Order Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Order ID</label>
                <p className="font-bold text-lg">#{order.trackingNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Order Date</label>
                <p>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="font-bold text-xl text-accent">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'Refunded' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-semibold">Customer Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p>{order.user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p>{order.user?.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p>{order.user?.userId}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>PIN: {order.shippingAddress?.zipCode}</p>
              </div>
            </div>
          </div>

          {/* Order Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-semibold">Order Management</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={updateOrderStatus}
                  disabled={updating || newStatus === order.orderStatus}
                  className="mt-2 w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Estimated Delivery</label>
                <input
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={updateDeliveryDate}
                  disabled={updating}
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Delivery Date'}
                </button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'Processing' ? 'bg-orange-100 text-orange-800' :
                  order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.orderStatus}
                </span>
                {order.orderStatus === 'Cancelled' && order.cancellationReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-red-700">{order.cancellationReason}</p>
                    {order.cancelledAt && (
                      <p className="text-xs text-red-600 mt-1">
                        Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Return Request Section */}
                {order.returnRequest?.isRequested && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <RotateCcw className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-orange-800">Return Request</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Requested:</span> {new Date(order.returnRequest.requestedAt).toLocaleString()}</p>
                      <p><span className="font-medium">Reason:</span> {decodeURIComponent(order.returnRequest.reason || '').replace(/&amp;#x27;/g, "'").replace(/&amp;/g, '&')}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          order.returnRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.returnRequest.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          order.returnRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.returnRequest.status}
                        </span>
                      </p>
                      {order.returnRequest.scheduledPickupDate && (
                        <p><span className="font-medium">Pickup Date:</span> {new Date(order.returnRequest.scheduledPickupDate).toLocaleString()}</p>
                      )}
                      {order.returnRequest.refundAmount && (
                        <p><span className="font-medium">Refund Amount:</span> ₹{order.returnRequest.refundAmount.toLocaleString('en-IN')}</p>
                      )}
                      {order.returnRequest.adminNotes && (
                        <p><span className="font-medium">Admin Notes:</span> {order.returnRequest.adminNotes}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Rating Section */}
                {order.rating?.isRated && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Customer Rating</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= order.rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>({order.rating.rating}/5)</span>
                      </div>
                      <p><span className="font-medium">Rated:</span> {new Date(order.rating.ratedAt).toLocaleString()}</p>
                      {order.rating.feedback && (
                        <p><span className="font-medium">Feedback:</span> {order.rating.feedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Return Management Panel */}
          {order.returnRequest?.isRequested && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold">Return Management</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Return Status</label>
                  <select
                    value={returnStatus}
                    onChange={(e) => setReturnStatus(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="collected">Collected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {(returnStatus === 'approved' || order.returnRequest?.scheduledPickupDate) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Scheduled Pickup Date</label>
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
                
                {returnStatus === 'completed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Refund Amount</label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about the return process..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-orange-500"
                    rows={3}
                  />
                </div>
                
                <button
                  onClick={updateReturnRequest}
                  disabled={updating}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Return Request'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6">Order Items ({order.items?.length || 0})</h2>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                  alt={item.product?.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.title}</h4>
                  <p className="text-sm text-gray-600">{item.product?.category}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                  <p className="font-semibold text-accent">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrderDetail;