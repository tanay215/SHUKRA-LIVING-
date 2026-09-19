import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="font-bold text-lg">SL{Date.now().toString().slice(-8)}</p>
        </div>
        <div className="text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-yellow-600">Processing</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
        </div>
        <button 
          onClick={() => {
            // Clear any temporary order data but keep user session
            localStorage.removeItem('orderData');
            localStorage.removeItem('checkoutData');
            navigate('/dashboard');
          }}
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
        >
          Continue Shopping
        </button>
        <button 
          onClick={() => navigate('/orders')}
          className="w-full mt-2 border border-accent text-accent py-3 rounded-lg font-semibold hover:bg-accent/10 transition"
        >
          View Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;