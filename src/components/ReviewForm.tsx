import React, { useState } from 'react';
import { Star, Plus, X } from 'lucide-react';
import { reviewAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
  existingReview?: any;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  onCancel,
  existingReview
}) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    pros: existingReview?.pros || [''],
    cons: existingReview?.cons || [''],
    wouldRecommend: existingReview?.wouldRecommend ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const reviewData = {
        productId,
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.filter(pro => pro.trim()),
        cons: formData.cons.filter(con => con.trim()),
        wouldRecommend: formData.wouldRecommend
      };

      if (existingReview) {
        await reviewAPI.updateReview(existingReview._id, reviewData);
        toast.success('Review updated successfully');
      } else {
        await reviewAPI.addReview(reviewData);
        toast.success('Review submitted successfully');
      }

      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const addPro = () => {
    if (formData.pros.length < 5) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, '']
      }));
    }
  };

  const addCon = () => {
    if (formData.cons.length < 5) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, '']
      }));
    }
  };

  const removePro = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const removeCon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const updatePro = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.map((pro, i) => i === index ? value : pro)
    }));
  };

  const updateCon = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.map((con, i) => i === index ? value : con)
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? 'Edit Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Summarize your review in a few words"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your experience with this product"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            maxLength={1000}
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.comment.length}/1000 characters
          </div>
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
        </div>

        {/* Pros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you like? (Optional)
          </label>
          {formData.pros.map((pro, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={pro}
                onChange={(e) => updatePro(index, e.target.value)}
                placeholder="What was good about this product?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                maxLength={200}
              />
              {formData.pros.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePro(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {formData.pros.length < 5 && (
            <button
              type="button"
              onClick={addPro}
              className="flex items-center text-sm text-amber-600 hover:text-amber-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another pro
            </button>
          )}
        </div>

        {/* Cons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What could be improved? (Optional)
          </label>
          {formData.cons.map((con, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={con}
                onChange={(e) => updateCon(index, e.target.value)}
                placeholder="What could be better?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                maxLength={200}
              />
              {formData.cons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCon(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {formData.cons.length < 5 && (
            <button
              type="button"
              onClick={addCon}
              className="flex items-center text-sm text-amber-600 hover:text-amber-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another con
            </button>
          )}
        </div>

        {/* Recommendation */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.wouldRecommend}
              onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              I would recommend this product to others
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};