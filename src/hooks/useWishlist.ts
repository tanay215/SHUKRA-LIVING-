import { useState, useEffect } from 'react';
import { Wishlist } from '../types';
import { wishlistAPI } from '../services/api';
import { useAuth } from './useAuth';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      await wishlistAPI.addItem(productId);
      await loadWishlist(); // Refresh wishlist
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.removeItem(productId);
      await loadWishlist(); // Refresh wishlist
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove from wishlist');
      return false;
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistAPI.clearWishlist();
      setWishlist(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear wishlist');
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist?.items.some(item => item.product._id === productId) || false;
  };

  return {
    wishlist,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refresh: loadWishlist,
    itemCount: wishlist?.itemCount || 0
  };
};