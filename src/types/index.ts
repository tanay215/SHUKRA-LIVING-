export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userId?: string;
  profileImage?: string;
  isVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orders: string[];
  wishlist: string[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Living' | 'Dining' | 'Bedroom' | 'Office' | 'Decor';
  subcategory?: string;
  images: Array<{
    url: string;
    alt?: string;
    optimized?: {
      thumbnail?: string;
      medium?: string;
      large?: string;
    };
  }>;
  specifications: {
    material?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: 'cm' | 'inch' | 'ft';
    };
    weight?: number;
    color?: string;
    finish?: string;
    texture?: string;
    type?: string;
    wood?: string;
    warranty?: string;
  };
  supplier?: {
    name?: string;
    brandName?: string;
    productionHouse?: string;
    location?: string;
    rating?: number;
    contact?: string;
  };
  purchasesLastMonth?: number;
  deliveryDays?: number;
  paymentOptions?: ('COD' | 'Card')[];
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  reviews?: Review[];
  tags?: string[];
  searchKeywords?: string[];
  isActive: boolean;
  offer?: string;
  viewCount?: number;
  lastViewed?: Date;
  discountPercentage?: number;
  returnPolicy?: {
    isReturnable: boolean;
    returnDays: number;
    returnConditions?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  helpfulBy: string[];
  verified: boolean;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: Array<{
    product: Product;
    addedAt: Date;
    priceWhenAdded: number;
    notifyOnDiscount: boolean;
    priceChange?: number;
    priceChangePercent?: number;
    isPriceDropped?: boolean;
    isPriceIncreased?: boolean;
  }>;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  returnRequest?: {
    isRequested: boolean;
    requestedAt?: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'collected' | 'completed';
    scheduledPickupDate?: string;
    collectedAt?: string;
    refundAmount?: number;
    refundedAt?: string;
    adminNotes?: string;
  };
  rating?: {
    isRated: boolean;
    ratedAt?: string;
    rating?: number;
    feedback?: string;
    adminResponse?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Admin {
  id: string;
  role: string;
  name: string;
}

export interface ProductForm {
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  category: string;
  subcategory?: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  specifications: {
    material: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      unit: string;
    };
    weight: string;
    color: string;
    finish: string;
    texture: string;
    type: string;
    wood: string;
    warranty: string;
  };
  supplier: {
    name: string;
    brandName: string;
    productionHouse: string;
    location: string;
    rating: string;
    contact: string;
  };
  stock: string;
  deliveryDays: string;
  paymentOptions: string[];
  offer?: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export interface SearchResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  facets: {
    categories: Array<{ _id: string; count: number }>;
    subcategories: Array<{ _id: string; count: number }>;
    priceRanges: Array<{ _id: number; count: number }>;
    ratings: Array<{ _id: number; count: number }>;
  };
  searchQuery: SearchFilters;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: string[];
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}