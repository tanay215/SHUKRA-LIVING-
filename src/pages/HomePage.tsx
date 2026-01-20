import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Categories from '../components/Categories';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Auth State
  const [auth, setAuth] = useState({
    user: null as any,
    token: AuthUtils.getToken(),
    isAuthenticated: AuthUtils.isAuthenticated()
  });

  // Cart State
  const [cartItems, setCartItems] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    freeDeliveryThreshold: 50000,
    deliveryCharge: 500,
    globalDiscount: 0,
    discountType: 'percentage'
  });

  // Load Data
  const loadUserProfile = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuth({
        user: response.data,
        token,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };


  useEffect(() => {
    loadUserProfile();
    loadSiteSettings();

    // Auto-refresh settings
    const settingsInterval = setInterval(loadSiteSettings, 30000);
    return () => clearInterval(settingsInterval);
  }, []);

  // Cart Logic
  const addToCart = (product: any) => {
    if (!AuthUtils.isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!product || !product._id) {
      alert('Invalid product');
      return;
    }

    if ((product.stock || 0) === 0) {
      alert('This product is out of stock!');
      return;
    }

    const currentCart = cartItems || [];
    const existingItem = currentCart.find(item => item.product._id === product._id);
    let newCartItems;

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

    const product = cartItems.find(item => item.product._id === productId)?.product;
    if (product && quantity > (product.stock || 0)) {
      alert(`Only ${product.stock} items available in stock!`);
      return;
    }

    const newCartItems = cartItems.map(item =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (siteSettings.globalDiscount <= 0) return originalPrice;
    if (siteSettings.discountType === 'percentage') {
      return Math.round(originalPrice - (originalPrice * siteSettings.globalDiscount / 100));
    } else {
      return Math.max(0, originalPrice - siteSettings.globalDiscount);
    }
  };

  const cartTotal = cartItems ? cartItems.reduce((sum, item) => {
    const price = getDiscountedPrice(item.product?.price || 0);
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0) : 0;

  const getDeliveryCharge = (total: number) => {
    return total >= siteSettings.freeDeliveryThreshold ? 0 : siteSettings.deliveryCharge;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream text-primary">


      <Header
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0)}
        user={auth.user}
      />

      <main className="flex-grow">
        <Hero />
        <Features />
        <Philosophy />
        <Categories addToCart={addToCart} />
        <Testimonials />
      </main>

      <Footer />

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-cream">
              <div>
                <h2 className="text-xl font-heading font-bold text-primary">Shopping Cart</h2>
                <p className="text-xs text-gray-500 mt-1 font-light">{cartItems?.length || 0} items in your bag</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!cartItems || cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600">Your cart is empty</h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-accent text-sm font-bold tracking-widest uppercase hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-heading font-medium text-primary text-sm line-clamp-2">{item.product.title}</h4>
                            <button
                              onClick={() => removeFromCart(item.product._id)}
                              className="text-gray-400 hover:text-red-500 transition ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.product.category}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-gray-50 text-gray-500"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-50 text-gray-500"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary">₹{((item.product.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems && cartItems.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{(cartTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className={getDeliveryCharge(cartTotal || 0) === 0 ? 'text-green-600' : ''}>
                      {getDeliveryCharge(cartTotal || 0) === 0 ? 'Free' : `₹${getDeliveryCharge(cartTotal || 0)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{((cartTotal || 0) + getDeliveryCharge(cartTotal || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-accent transition-colors shadow-lg"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;