import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { searchAPI } from '../services/api';
import { Product } from '../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  title: string;
  category: string;
  price: number;
  images: Array<{ url: string }>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search for furniture...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load popular searches on mount
    loadPopularSearches();
    
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounced search suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        loadSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const loadPopularSearches = async () => {
    try {
      const response = await searchAPI.getPopularSearches();
      setPopularSearches(response.popularSearches || []);
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const response = await searchAPI.getSuggestions(searchQuery);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch(finalQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    handleSearch(suggestion.title);
  };

  const handlePopularSearchClick = (popularQuery: string) => {
    setQuery(popularQuery);
    handleSearch(popularQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
              <span className="mt-2 block">Searching...</span>
            </div>
          )}

          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Products
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  {suggestion.images?.[0] && (
                    <img
                      src={suggestion.images[0].url}
                      alt={suggestion.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.category} • ₹{suggestion.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!isLoading && query.length < 2 && popularSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular Searches
              </div>
              <div className="p-2">
                {popularSearches.slice(0, 8).map((popularQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearchClick(popularQuery)}
                    className="inline-block m-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {popularQuery}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>No products found for "{query}"</div>
              <div className="text-sm mt-1">Try different keywords</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};