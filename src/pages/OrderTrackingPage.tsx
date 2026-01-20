import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackingNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingInput, setTrackingInput] = useState(trackingNumber || '');

  useEffect(() => {
    if (trackingNumber) {
      trackOrder(trackingNumber);
    }
  }, [trackingNumber]);

  const trackOrder = async (trackingNum) => {
    try {
      setLoading(true);
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/orders/track/${trackingNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to track order:', error);
      alert('Order not found. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Track Your Order</h1>
          <button onClick={() => navigate('/dashboard')} className="text-accent hover:underline">
            Back to Shop
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {!order ? (
          <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Enter Tracking Number</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your tracking number (e.g., SL123456789)"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
              />
              <button 
                onClick={() => trackOrder(trackingInput)}
                disabled={loading || !trackingInput.trim()}
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Or view all your orders:</p>
              <button 
                onClick={() => navigate('/orders')}
                className="text-accent hover:underline"
              >
                View Order History
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order #{order.trackingNumber}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <p className="text-sm text-gray-600">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Total Amount: ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
                  <p className="text-sm text-gray-600">Items: {order.items?.length || 0} products</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.street || 'Address not available'}<br/>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br/>
                    {order.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-6">Order Status</h3>
              <div className="space-y-4">
                {getStatusSteps(order.orderStatus).map((step, index) => (
                  <div key={step.name} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500 text-white' : 
                      step.current ? 'bg-accent text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${
                        step.current ? 'text-accent' : step.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {step.name === 'Placed' && 'Order received and being processed'}
                        {step.name === 'Confirmed' && 'Order confirmed and payment verified'}
                        {step.name === 'Processing' && 'Order is being prepared for shipment'}
                        {step.name === 'Shipped' && 'Order has been shipped and is on the way'}
                        {step.name === 'Delivered' && 'Order has been delivered successfully'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Estimated Delivery</h4>
                <p className="text-blue-700 font-medium">
                  {order.orderStatus === 'Delivered' ? (
                    <span className="text-green-700">✅ Delivered</span>
                  ) : order.estimatedDelivery ? (
                    <span>
                      📅 {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                      <br/>
                      🕐 {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : (
                    <span className="text-orange-600">⏳ Not scheduled yet</span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OrderTrackingPage;