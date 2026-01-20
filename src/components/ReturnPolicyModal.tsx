import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

const ReturnPolicyModal: React.FC<ReturnPolicyModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const [isReturnable, setIsReturnable] = useState(product?.returnPolicy?.isReturnable || false);
  const [returnDays, setReturnDays] = useState(product?.returnPolicy?.returnDays || 7);
  const [returnConditions, setReturnConditions] = useState(product?.returnPolicy?.returnConditions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReturnable && (returnDays < 1 || returnDays > 365)) {
      alert('Return days must be between 1 and 365');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      await axios.put(`${API_BASE_URL}/admin/products/${product._id}/return-policy`, 
        {
          isReturnable,
          returnDays: isReturnable ? returnDays : 0,
          returnConditions: returnConditions.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Return policy updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Update return policy error:', error);
      alert(error.response?.data?.error || 'Failed to update return policy');
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
          <h3 className="text-lg font-semibold">Return Policy Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Product: {product?.title}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isReturnable}
                onChange={(e) => setIsReturnable(e.target.checked)}
                className="mr-2"
              />
              <span className="font-medium">Allow Returns</span>
            </label>
          </div>
          
          {isReturnable && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Return Days Limit *
                </label>
                <input
                  type="number"
                  value={returnDays}
                  onChange={(e) => setReturnDays(parseInt(e.target.value) || 0)}
                  min="1"
                  max="365"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Number of days after delivery within which returns are allowed (1-365)
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Return Conditions (Optional)
                </label>
                <textarea
                  value={returnConditions}
                  onChange={(e) => setReturnConditions(e.target.value)}
                  placeholder="e.g., Product must be in original packaging, unused condition..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {returnConditions.length}/500 characters
                </div>
              </div>
            </>
          )}
          
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
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnPolicyModal;