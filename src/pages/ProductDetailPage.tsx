import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, ShoppingBag, Truck, Plus, Minus, X,
  ShieldCheck, RotateCcw, Hammer, Leaf
} from 'lucide-react';
import Header from '../components/Header';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  feedback?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  images: { url: string }[];
  tags?: string[];
  rating?: {
    average: number;
    count: number;
  };
  deliveryDays?: number;
  supplier?: {
    name: string;
    brandName?: string;
  };
  specifications?: {
    material?: string;
    color?: string;
    finish?: string;
    wood?: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    warranty?: string;
  };
  returnPolicy?: {
    isReturnable: boolean;
    returnDays: number;
    returnConditions?: string;
  };
  reviews?: Review[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SiteSettings {
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  globalDiscount: number;
  discountType: 'percentage' | 'fixed';
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    freeDeliveryThreshold: 50000,
    deliveryCharge: 500,
    globalDiscount: 0,
    discountType: 'percentage'
  });

  useEffect(() => {
    loadProduct();
    loadSiteSettings();
  }, [id]);

  const loadSiteSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (siteSettings.globalDiscount <= 0) return originalPrice;

    if (siteSettings.discountType === 'percentage') {
      return Math.round(originalPrice - (originalPrice * siteSettings.globalDiscount / 100));
    } else {
      return Math.max(0, originalPrice - siteSettings.globalDiscount);
    }
  };

  const getSavings = (originalPrice: number) => {
    if (siteSettings.globalDiscount <= 0) return 0;

    if (siteSettings.discountType === 'percentage') {
      return Math.round(originalPrice * siteSettings.globalDiscount / 100);
    } else {
      return Math.min(siteSettings.globalDiscount, originalPrice);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      if (!id) {
        navigate('/dashboard');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(response.data);
      setActiveImageIndex(0);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (!AuthUtils.isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if ((product.stock || 0) === 0) {
      alert('This product is out of stock!');
      return;
    }

    const currentCart = cartItems || [];
    const existingItem = currentCart.find(item => item.product._id === product._id);
    let newCartItems: CartItem[];

    if (existingItem) {
      if (existingItem.quantity >= (product.stock || 0)) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
      }
      newCartItems = currentCart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCartItems = [...currentCart, { product, quantity: 1 }];
    }

    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const newCartItems = cartItems.filter(item => item.product._id !== productId);
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const productItem = cartItems.find(item => item.product._id === productId)?.product;
    if (productItem && quantity > (productItem.stock || 0)) {
      alert(`Only ${productItem.stock} items available in stock!`);
      return;
    }
    const newCartItems = cartItems.map(item =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const buyNow = () => {
    if (!AuthUtils.isAuthenticated()) {
      alert('Please login to buy now');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if ((product?.stock || 0) === 0) return;

    if (product) {
      const buyNowCart = [{ product, quantity: 1 }];
      localStorage.setItem('cartItems', JSON.stringify(buyNowCart));
      setCartItems(buyNowCart);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountedPrice = getDiscountedPrice(product.price);
  const savings = getSavings(product.price);

  return (
    <div className="min-h-screen bg-cream font-sans text-primary">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
      />

      <main className="container mx-auto px-4 py-8 lg:px-12 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left Column: Images */}
          <div className="space-y-6">
            <div className="aspect-[4/5] w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.images?.[activeImageIndex]?.url || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col space-y-8">

            {/* Header Info */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-primary mb-3 leading-tight">
                {product.title}
              </h1>
              <div className="space-y-1">
                <p className="text-sm tracking-widest uppercase font-semibold text-secondary">
                  {product.supplier?.brandName || product.brand || 'SHUKRA LIVING'}
                </p>
                <p className="text-secondary/80 font-medium">
                  {product.category}
                </p>
              </div>
            </div>

            {/* Price Block */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-4xl font-bold text-primary">
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </span>
                {siteSettings.globalDiscount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through decoration-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-accent text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                      {siteSettings.discountType === 'percentage'
                        ? `${siteSettings.globalDiscount}% OFF`
                        : `₹${siteSettings.globalDiscount} OFF`}
                    </span>
                  </>
                )}
              </div>
              {siteSettings.globalDiscount > 0 && (
                <p className="text-accent font-medium text-sm">
                  You save ₹{savings.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-sand/20 rounded-lg p-4 flex items-center gap-3 text-secondary">
              <Truck size={20} className="text-secondary" />
              <span className="font-medium">
                Delivery by {new Date(Date.now() + (product.deliveryDays || 7) * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: '2-digit', year: 'numeric' })}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              {(product.stock || 0) > 0 ? (
                <div className="flex gap-4">
                  <button
                    onClick={buyNow}
                    className="flex-1 bg-primary text-white hover:bg-primary/90 py-4 px-8 rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 border-2 border-olive-dark text-olive-dark hover:bg-olive-dark hover:text-white py-4 px-8 rounded-full font-semibold text-lg transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium border border-red-100">
                  Currently Out of Stock
                </div>
              )}

              {/* Feature Icons */}
              <div className="flex flex-wrap justify-between gap-4 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <Hammer size={18} />
                  <span>Handcrafted</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <Leaf size={18} />
                  <span>Premium {product.specifications?.wood || 'Wood'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <RotateCcw size={18} />
                  <span>{product.returnPolicy?.returnDays || 7}-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <ShieldCheck size={18} />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Product Details Table */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-primary">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Material</span>
                  <span className="font-medium text-primary">{product.specifications?.material || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Wood Type</span>
                  <span className="font-medium text-primary">{product.specifications?.wood || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Color</span>
                  <span className="font-medium text-primary">{product.specifications?.color || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Finish</span>
                  <span className="font-medium text-primary">{product.specifications?.finish || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Dimensions</span>
                  <span className="font-medium text-primary">
                    {product.specifications?.dimensions
                      ? `${product.specifications.dimensions.length} x ${product.specifications.dimensions.width} x ${product.specifications.dimensions.height} ${product.specifications.dimensions.unit}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Delivery Time</span>
                  <span className="font-medium text-primary">{product.deliveryDays || 7} Days</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-bold text-primary">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

          </div>
        </div>

        {/* Reviews Section (Kept below but styled cleanly) */}
        <div className="mt-20 border-t border-gray-200 pt-12">
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">Customer Reviews</h2>
          <div className="max-w-4xl mx-auto">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="grid gap-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {review.user.firstName[0]}{review.user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{review.user.firstName} {review.user.lastName}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 ml-14">{review.feedback}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No reviews yet.</div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-5 border-b flex justify-between items-center bg-primary text-white">
              <h2 className="font-serif text-xl font-bold">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:bg-white/10 p-1 rounded"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.product._id} className="flex gap-4 border-b pb-4 last:border-0">
                  <img src={item.product.images[0]?.url} className="w-20 h-20 object-cover rounded bg-gray-50" />
                  <div className="flex-1">
                    <h4 className="font-medium text-primary">{item.product.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 border rounded px-2 py-1">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}><Minus size={14} /></button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <span className="font-bold">₹{(item.quantity * getDiscountedPrice(item.product.price)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && <div className="text-center py-10 text-gray-500">Cart is empty</div>}
            </div>

            <div className="p-5 border-t bg-gray-50">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>₹{cartItems.reduce((acc, item) => acc + (item.quantity * getDiscountedPrice(item.product.price)), 0).toLocaleString('en-IN')}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary/90">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;