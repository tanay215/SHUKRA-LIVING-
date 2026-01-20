import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, Star, Heart } from 'lucide-react';
import { searchAPI } from '../services/api';
import { SearchResponse, SearchFilters, Product } from '../types';
import { SearchBar } from '../components/SearchBar';
import { WishlistButton } from '../components/WishlistButton';
import toast from 'react-hot-toast';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 20,
    inStock: searchParams.get('inStock') !== 'false'
  });

  useEffect(() => {
    performSearch();
  }, [filters]);

  const performSearch = async () => {
    try {
      setIsLoading(true);
      const response = await searchAPI.search(filters);
      setSearchResults(response.data);
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 1) {
          params.set(key, String(value));
        }
      });
      setSearchParams(params);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, q: query, page: 1 }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      q: filters.q,
      sortBy: 'relevance',
      page: 1,
      limit: 20,
      inStock: true
    });
  };

  const renderPriceRangeFilter = () => {
    const ranges = [
      { label: 'Under ₹5,000', min: 0, max: 5000 },
      { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
      { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
      { label: '₹30,000 - ₹50,000', min: 30000, max: 50000 },
      { label: 'Above ₹50,000', min: 50000, max: undefined }
    ];

    return (
      <div className="space-y-2">
        {ranges.map((range, index) => (
          <label key={index} className="flex items-center">
            <input
              type="radio"
              name="priceRange"
              checked={filters.minPrice === range.min && filters.maxPrice === range.max}
              onChange={() => handleFilterChange('minPrice', range.min) || handleFilterChange('maxPrice', range.max)}
              className="mr-2"
            />
            <span className="text-sm">{range.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderProductCard = (product: Product) => {
    if (viewMode === 'list') {
      return (
        <div key={product._id} className="bg-white rounded-lg shadow-md p-4 flex space-x-4">
          <Link to={`/product/${product._id}`} className="flex-shrink-0">
            <img
              src={product.images[0]?.url}
              alt={product.title}
              className="w-24 h-24 object-cover rounded"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/product/${product._id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating.average.toFixed(1)} ({product.rating.count})
                </span>
              </div>
              <WishlistButton productId={product._id} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images[0]?.url}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
          </Link>
          <div className="absolute top-3 right-3">
            <WishlistButton productId={product._id} />
          </div>
          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              {product.discountPercentage}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 hover:text-amber-600 transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center mb-2">
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating.average.toFixed(1)} ({product.rating.count})
              </span>
            </div>
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar onSearch={handleSearch} className="max-w-2xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Living">Living Room</option>
                  <option value="Dining">Dining Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Office">Office</option>
                  <option value="Decor">Decor</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Price Range</h4>
                {renderPriceRangeFilter()}
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </button>
                {searchResults && (
                  <p className="text-gray-600">
                    {searchResults.pagination.totalItems} results
                    {filters.q && ` for "${filters.q}"`}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {/* Results */}
            {searchResults && !isLoading && (
              <>
                {searchResults.products.length > 0 ? (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                  }>
                    {searchResults.products.map(renderProductCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Clear filters and try again
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {searchResults.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {searchResults.pagination.hasPrev && (
                        <button
                          onClick={() => handlePageChange(searchResults.pagination.currentPage - 1)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}
                      
                      {Array.from({ length: Math.min(5, searchResults.pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-md text-sm ${
                              page === searchResults.pagination.currentPage
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {searchResults.pagination.hasNext && (
                        <button
                          onClick={() => handlePageChange(searchResults.pagination.currentPage + 1)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};