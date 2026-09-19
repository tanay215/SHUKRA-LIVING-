import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors without auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle specific 401 token expiry errors, not all 401s
    if (error.response?.status === 401 && 
        (error.response?.data?.error === 'Token expired.' || 
         error.response?.data?.error === 'Invalid token.')) {
      // Only logout if explicitly token related, not for other auth errors
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/admin') && !currentPath.includes('/signup')) {
        console.log('Token expired, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // For all other errors (network, server, etc.), don't auto-logout
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (data: { phone: string; email: string; firstName: string }) =>
    api.post('/auth/send-otp', data),
  
  verifyOTP: (data: { phone: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  
  createAccount: (data: { phone: string; email: string; firstName: string; lastName: string; password: string }) =>
    api.post('/auth/create-account', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) =>
    api.get('/products', { params }),
  
  getProduct: (id: string) =>
    api.get(`/products/${id}`),
  
  addReview: (id: string, data: { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
  
  seedProducts: () =>
    api.post('/products/seed'),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data: any) =>
    api.put('/users/profile', data),
  
  addToWishlist: (productId: string) =>
    api.post(`/users/wishlist/${productId}`),
  
  removeFromWishlist: (productId: string) =>
    api.delete(`/users/wishlist/${productId}`),
  
  createOrder: (data: any) =>
    api.post('/users/orders', data),
  
  getOrders: () =>
    api.get('/users/orders'),
  
  trackOrder: (trackingNumber: string) =>
    api.get(`/users/orders/${trackingNumber}/track`),
};

// Admin API
export const adminAPI = {
  login: (data: { adminId: string; password: string }) =>
    api.post('/admin/login', data),
  
  getProducts: () =>
    api.get('/admin/products'),
  
  createProduct: (data: any) =>
    api.post('/admin/products', data),
  
  updateProduct: (id: string, data: any) =>
    api.put(`/admin/products/${id}`, data),
  
  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`),
  
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  getOrders: () =>
    api.get('/admin/orders'),
  
  updateOrder: (id: string, data: any) =>
    api.put(`/admin/orders/${id}`, data),
  
  updateReturnPolicy: (productId: string, data: any) =>
    api.put(`/admin/products/${productId}/return-policy`, data),
  
  getReturnRequests: () =>
    api.get('/admin/returns'),
  
  updateReturnRequest: (orderId: string, data: any) =>
    api.put(`/admin/returns/${orderId}`, data),
};

// Orders API
export const ordersAPI = {
  processPayment: (data: any) =>
    api.post('/orders/process-payment', data),
  
  getOrderStatus: (orderId: string) =>
    api.get(`/orders/${orderId}/status`),
};

// Search API
export const searchAPI = {
  search: (params: any) =>
    api.get('/search', { params }),
  
  getSuggestions: (query: string) =>
    api.get('/search/suggestions', { params: { q: query } }),
  
  getPopularSearches: () =>
    api.get('/search/popular'),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () =>
    api.get('/wishlist'),
  
  addItem: (productId: string) =>
    api.post('/wishlist/add', { productId }),
  
  removeItem: (productId: string) =>
    api.delete(`/wishlist/remove/${productId}`),
  
  checkProduct: (productId: string) =>
    api.get(`/wishlist/check/${productId}`),
  
  clearWishlist: () =>
    api.delete('/wishlist/clear'),
  
  getCount: () =>
    api.get('/wishlist/count'),
};

// Reviews API
export const reviewAPI = {
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  
  addReview: (data: any) =>
    api.post('/reviews', data),
  
  updateReview: (reviewId: string, data: any) =>
    api.put(`/reviews/${reviewId}`, data),
  
  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),
  
  markHelpful: (reviewId: string) =>
    api.post(`/reviews/${reviewId}/helpful`),
  
  unmarkHelpful: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}/helpful`),
  
  getUserReviews: (params?: any) =>
    api.get('/reviews/user', { params }),
};

// Returns API
export const returnsAPI = {
  requestReturn: (orderId: string, data: { reason: string }) =>
    api.post(`/returns/request/${orderId}`, data),
  
  getReturnStatus: (orderId: string) =>
    api.get(`/returns/status/${orderId}`),
  
  submitRating: (orderId: string, data: { rating: number; feedback: string }) =>
    api.post(`/returns/rating/${orderId}`, data),
};

// Admin API
export const adminAPI = {