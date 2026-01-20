import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';
import type { User, CartItem } from '../types';

const API_BASE_URL = 'http://localhost:30011/api';

interface SiteSettings {
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  globalDiscount: number;
  discountType: 'percentage' | 'fixed';
}

interface CouponResponse {
  coupon: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  discount: {
    discountAmount: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState('default');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: '', phone: '', street: '', city: '', state: '', zipCode: ''
  });
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: AuthUtils.getToken(),
    isAuthenticated: AuthUtils.isAuthenticated()
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    freeDeliveryThreshold: 50000,
    deliveryCharge: 500,
    globalDiscount: 0,
    discountType: 'percentage'
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResponse | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadSiteSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuth(prev => ({ ...prev, user: response.data }));
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Only logout on 401 Unauthorized (token expired), not on other errors
      if (error.response?.status === 401) {
        AuthUtils.clearAuth();
        navigate('/login');
      }
      // For other errors (network, server), keep user logged in
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

  // Calculate coupon discount
  const couponDiscount = appliedCoupon?.discount?.discountAmount || 0;
  const subtotalAfterCoupon = Math.max(0, cartTotal - couponDiscount);

  const checkoutDelivery = getDeliveryCharge(subtotalAfterCoupon);
  const checkoutTotal = subtotalAfterCoupon + checkoutDelivery;

  // Auto-refresh settings for real-time updates
  useEffect(() => {
    const interval = setInterval(loadSiteSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Validate and apply coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const token = AuthUtils.getToken();
      if (!token) {
        setCouponError('Please login to use coupon codes');
        return;
      }

      // Calculate subtotal before delivery charges for coupon validation
      const subtotalForCoupon = cartTotal;

      const response = await axios.post(
        `${API_BASE_URL}/coupons/validate`,
        {
          code: couponCode.trim().toUpperCase(),
          orderAmount: subtotalForCoupon
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAppliedCoupon(response.data);
      setCouponError('');
      alert('Coupon applied successfully!');
    } catch (error: any) {
      setCouponError(error.response?.data?.message || error.response?.data?.error || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const placeOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      alert('No items to order');
      return;
    }

    if (!auth.token || !auth.user) {
      alert('Please login to place order');
      navigate('/login');
      return;
    }

    try {
      const shippingAddr = selectedAddress === 'new' ? deliveryAddress : {
        name: `${auth.user?.firstName} ${auth.user?.lastName}`,
        phone: auth.user?.phone,
        street: auth.user?.address?.street || '',
        city: auth.user?.address?.city || '',
        state: auth.user?.address?.state || '',
        zipCode: auth.user?.address?.zipCode || ''
      };

      // Calculate original subtotal (before coupon, after global discount)
      const originalSubtotal = cartTotal;

      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: getDiscountedPrice(item.product.price)
        })),
        totalAmount: originalSubtotal, // Subtotal before coupon and delivery charges
        paymentMethod: selectedPaymentMethod,
        shippingAddress: shippingAddr,
        couponCode: appliedCoupon?.coupon?.code || null
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      setCartItems([]);
      localStorage.removeItem('cartItems');
      navigate('/order-confirmation');
      alert('Order placed successfully!');
    } catch (error: any) {
      console.error('Order placement error:', error);
      alert('Failed to place order: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-4">No items to checkout</h2>
          <button onClick={() => navigate('/dashboard')} className="bg-accent text-white px-6 py-2 rounded-lg">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Checkout</h1>
          <button onClick={() => navigate('/dashboard')} className="text-accent hover:underline">
            Continue Shopping
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Address', icon: '📍' },
              { step: 2, title: 'Payment', icon: '💳' },
              { step: 3, title: 'Review', icon: '📋' }
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep >= item.step ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {checkoutStep > item.step ? '✓' : item.step}
                </div>
                <span className={`ml-2 text-sm font-medium ${checkoutStep >= item.step ? 'text-accent' : 'text-gray-600'
                  }`}>
                  {item.title}
                </span>
                {item.step < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {checkoutStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>

                {/* Default Address */}
                <div className="mb-6">
                  <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      value="default"
                      checked={selectedAddress === 'default'}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1 text-accent"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{auth.user?.firstName} {auth.user?.lastName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {auth.user?.address?.street || 'No address saved'}<br />
                        {auth.user?.address?.city}, {auth.user?.address?.state} {auth.user?.address?.zipCode}<br />
                        Phone: {auth.user?.phone}
                      </div>
                    </div>
                  </label>
                </div>

                {/* New Address */}
                <div className="mb-6">
                  <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      value="new"
                      checked={selectedAddress === 'new'}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1 text-accent"
                    />
                    <div className="ml-3 w-full">
                      <div className="font-medium mb-3">Add New Address</div>
                      {selectedAddress === 'new' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={deliveryAddress.name}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                            className="p-3 border rounded focus:outline-none focus:border-accent"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={deliveryAddress.phone}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                            className="p-3 border rounded focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={deliveryAddress.street}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                            className="md:col-span-2 p-3 border rounded focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={deliveryAddress.city}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                            className="p-3 border rounded focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={deliveryAddress.state}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                            className="p-3 border rounded focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            value={deliveryAddress.zipCode}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                            className="p-3 border rounded focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPaymentMethod === 'cod'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="text-accent"
                    />
                    <div className="ml-3">
                      <div className="font-medium">💵 Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive your order</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="text-accent"
                    />
                    <div className="ml-3">
                      <div className="font-medium">💳 Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Pay securely with your card</div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="flex-1 border border-accent text-accent py-3 rounded-lg font-semibold hover:bg-accent/10"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {checkoutStep === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                {/* Address Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600">
                    {selectedAddress === 'default' ? (
                      <>
                        {auth.user?.firstName} {auth.user?.lastName}<br />
                        {auth.user?.address?.street}<br />
                        {auth.user?.address?.city}, {auth.user?.address?.state} {auth.user?.address?.zipCode}<br />
                        Phone: {auth.user?.phone}
                      </>
                    ) : (
                      <>
                        {deliveryAddress.name}<br />
                        {deliveryAddress.street}<br />
                        {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}<br />
                        Phone: {deliveryAddress.phone}
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <div className="text-sm text-gray-600">
                    {selectedPaymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Credit/Debit Card'}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="flex-1 border border-accent text-accent py-3 rounded-lg font-semibold hover:bg-accent/10"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={placeOrder}
                    className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            {/* Coupon/Promo Code Section */}
            <div className="mb-4 pb-4 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code / Coupon
              </label>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        validateCoupon();
                      }
                    }}
                    className="flex-1 p-2 border rounded focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isValidatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-800">
                        ✓ {appliedCoupon.coupon.code} Applied
                      </div>
                      {appliedCoupon.coupon.description && (
                        <div className="text-xs text-green-600 mt-1">
                          {appliedCoupon.coupon.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-sm text-red-600">
                  {couponError}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-4">
              {(cartItems || []).map((item) => (
                <div key={item.product._id} className="flex gap-3">
                  <img
                    src={item.product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                    alt={item.product.title}
                    className="w-15 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.title}</h4>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    <div className="text-sm">
                      {siteSettings.globalDiscount > 0 ? (
                        <>
                          <p className="font-semibold text-red-600">₹{(getDiscountedPrice(item.product.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500 line-through">₹{((item.product.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</p>
                        </>
                      ) : (
                        <p className="font-semibold text-accent">₹{((item.product.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              {/* Original Amount */}
              {siteSettings.globalDiscount > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Original Amount:</span>
                  <span className="line-through">₹{cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Discount Applied */}
              {siteSettings.globalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({siteSettings.discountType === 'percentage' ? `${siteSettings.globalDiscount}%` : `₹${siteSettings.globalDiscount}`} OFF):</span>
                  <span>-₹{(cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) - cartTotal).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal ({(cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)} items):</span>
                <span>₹{(cartTotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Coupon Discount */}
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Coupon Discount ({appliedCoupon.coupon.discountType === 'percentage'
                      ? `${appliedCoupon.coupon.discountValue}% OFF`
                      : `₹${appliedCoupon.coupon.discountValue} OFF`}):
                  </span>
                  <span className="font-medium">
                    -₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Delivery Charges */}
              <div className="flex justify-between text-sm">
                <span>Delivery Charges:</span>
                {checkoutDelivery === 0 ? (
                  <div className="text-right">
                    <span className="text-green-600 font-bold">FREE</span>
                    <div className="text-xs text-green-500">Above ₹{siteSettings.freeDeliveryThreshold.toLocaleString('en-IN')}</div>
                  </div>
                ) : (
                  <span>₹{siteSettings.deliveryCharge.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Final Total */}
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-accent">
                <span>Total Amount to Pay:</span>
                <span>₹{(checkoutTotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Savings Summary */}
              {(siteSettings.globalDiscount > 0 || appliedCoupon) && (
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <span className="text-green-700 text-sm font-medium">
                    🎉 You're saving ₹{(
                      (cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) - cartTotal) +
                      (appliedCoupon ? couponDiscount : 0)
                    ).toLocaleString('en-IN')} on this order!
                  </span>
                </div>
              )}

              {/* Payment Method Info */}
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <span className="text-blue-700 text-sm">
                  {selectedPaymentMethod === 'cod' ?
                    '💵 Pay when you receive your order' :
                    '💳 Secure online payment'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;