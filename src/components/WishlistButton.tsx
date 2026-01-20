import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = '',
  showText = false,
  size = 'md'
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [productId, isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.checkProduct(productId);
      setIsInWishlist(response.isInWishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeItem(productId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addItem(productId);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${className}
        ${isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors duration-200 rounded-full hover:bg-gray-100
        ${showText ? 'flex items-center space-x-2' : ''}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`
          ${sizeClasses[size]}
          ${isInWishlist ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      {showText && (
        <span className="text-sm font-medium">
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};