import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAnyToken = () => {
    // Try AuthUtils first
    const authUtilsToken = AuthUtils.getToken();
    if (authUtilsToken) return authUtilsToken;
    
    // Try direct localStorage access
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;
    
    // Try auth_token key
    const authToken = localStorage.getItem('auth_token');
    if (authToken) return authToken;
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for return');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Debug localStorage
      console.log('LocalStorage debug:', {
        auth_token: localStorage.getItem('auth_token'),
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        allKeys: Object.keys(localStorage)
      });
      
      const token = getAnyToken();
      console.log('Token check:', { 
        token: token ? 'Found' : 'Not found', 
        isAuthenticated: AuthUtils.isAuthenticated(),
        tokenLength: token?.length 
      });
      
      if (!token) {
        alert('Please login again - no authentication token found');
        return;
      }

      console.log('Making return request for order:', orderId);
      const response = await axios.post(`${API_BASE_URL}/returns/request/${orderId}`, 
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Return request response:', response.data);
      alert('Return request submitted successfully!');
      onSuccess();
      onClose();
      setReason('');
    } catch (error: any) {
      console.error('Return request error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Request Return</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Reason for Return *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you want to return this order..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;