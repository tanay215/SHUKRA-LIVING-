import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
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
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAnyToken();
      
      console.log('Rating token check:', { 
        token: token ? 'Found' : 'Not found', 
        tokenLength: token?.length 
      });
      
      if (!token) {
        alert('Please login again - no authentication token found');
        return;
      }

      await axios.post(`${API_BASE_URL}/returns/rating/${orderId}`, 
        { rating, feedback: feedback.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Rating submitted successfully!');
      onSuccess();
      onClose();
      setRating(0);
      setFeedback('');
    } catch (error: any) {
      console.error('Rating submission error:', error);
      alert(error.response?.data?.error || 'Failed to submit rating');
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
          <h3 className="text-lg font-semibold">Rate Your Order</h3>
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
              Rating *
            </label>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    className={`${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {rating === 0 && 'Please select a rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this order..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {feedback.length}/1000 characters
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
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;