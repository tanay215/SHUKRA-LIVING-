import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { WishlistButton } from '../components/WishlistButton';
import toast from 'react-hot-toast';

export const WishlistPage: React.FC = () => {
  const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlist();

  const handleRemoveItem = async (productId: string) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      toast.success('Item removed from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      const success = await clearWishlist();
      if (success) {
        toast.success('Wishlist cleared');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">
              Save items you love to your wishlist and never lose track of them.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlist.items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <Link to={`/product/${item.product._id}`}>
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="absolute top-3 right-3">
                  <WishlistButton productId={item.product._id} />
                </div>
                {item.product.discountPercentage && item.product.discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {item.product.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${item.product._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-amber-600 transition-colors line-clamp-2">
                    {item.product.title}
                  </h3>
                </Link>

                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{item.product.price.toLocaleString()}
                  </span>
                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{item.product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Price Change Indicator */}
                {item.priceChange !== undefined && item.priceChange !== 0 && (
                  <div className={`flex items-center mb-2 text-sm ${
                    item.isPriceDropped ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.isPriceDropped ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    )}
                    <span>
                      {item.isPriceDropped ? 'Price dropped' : 'Price increased'} by ₹
                      {Math.abs(item.priceChange || 0).toLocaleString()} 
                      ({Math.abs(item.priceChangePercent || 0)}%)
                    </span>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-3">
                  {item.product.stock > 0 ? (
                    <span className="text-green-600 text-sm font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mb-3">
                  Added on {new Date(item.addedAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-center text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};