import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingBag, Truck, Plus, Minus, X } from 'lucide-react';
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
      console.log('Loading product with ID:', id);

      if (!id) {
        console.error('No product ID provided');
        alert('Invalid product ID');
        navigate('/dashboard');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      console.log('Product loaded successfully:', response.data);
      setProduct(response.data);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      console.error('Product ID:', id);
      console.error('Error details:', error.response?.data);

      if (error.response?.status === 404) {
        alert('Product not found. It may have been removed or the link is invalid.');
      } else {
        alert('Failed to load product. Please try again.');
      }
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
    alert('Added to cart!');
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

    if (!product || !product._id) {
      alert('Invalid product');
      return;
    }

    if ((product.stock || 0) === 0) {
      alert('This product is out of stock!');
      return;
    }

    // Create temporary cart with just this product
    const buyNowCart = [{ product, quantity: 1 }];
    localStorage.setItem('cartItems', JSON.stringify(buyNowCart));
    setCartItems(buyNowCart);

    // Navigate directly to checkout
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-white rounded overflow-hidden">
                    <img src={img.url} alt={`${product.title} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">{product.title}</h1>
              <p className="text-accent font-semibold">{product.supplier?.brandName || product.brand || 'Shukra Living'}</p>
              <p className="text-gray-600">{product.category} {product.subcategory && `• ${product.subcategory}`}</p>
              {product.specifications?.material && (
                <p className="text-sm text-gray-500 mt-1">{product.specifications.material}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {product.rating && product.rating.count > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating!.average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating.count} reviews)</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No ratings yet</span>
              )}
            </div>

            <div className="space-y-2">
              {siteSettings.globalDiscount > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">₹{getDiscountedPrice(product.price || 0).toLocaleString('en-IN')}</span>
                    <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-bold">
                      {siteSettings.discountType === 'percentage' ? `${siteSettings.globalDiscount}% OFF` : `₹${siteSettings.globalDiscount} OFF`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-gray-500 line-through">₹{product.price?.toLocaleString('en-IN')}</span>
                    <span className="text-green-600 font-semibold">You save ₹{getSavings(product.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  ₹{product.price?.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <Truck size={20} />
                <span className="font-semibold">Delivery: {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>

            {(product.stock || 0) === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-semibold">Product Not Available</p>
                <p className="text-red-500 text-sm">This item is currently out of stock</p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-white border-2 border-accent text-accent py-3 px-6 rounded-lg font-semibold hover:bg-accent hover:text-white transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={buyNow}
                  className="flex-1 bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-accent/90 transition"
                >
                  Buy Now
                </button>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Material:</span> {product.specifications?.material || 'Premium Wood'}</div>
                <div><span className="font-medium">Color:</span> {product.specifications?.color || 'Natural'}</div>
                <div><span className="font-medium">Finish:</span> {product.specifications?.finish || 'Polished'}</div>
                <div><span className="font-medium">Wood Type:</span> {product.specifications?.wood || 'Teak'}</div>
                {product.specifications?.dimensions && (
                  <div><span className="font-medium">Dimensions:</span> {product.specifications.dimensions.length}x{product.specifications.dimensions.width}x{product.specifications.dimensions.height} {product.specifications.dimensions.unit}</div>
                )}
                {product.specifications?.warranty && (
                  <div><span className="font-medium">Warranty:</span> {product.specifications.warranty}</div>
                )}
                {product.supplier?.name && (
                  <div><span className="font-medium">Supplier:</span> {product.supplier.name}</div>
                )}
                <div><span className="font-medium">Delivery:</span> {product.deliveryDays || 7} days</div>
                {product.returnPolicy && (
                  <div className="col-span-2">
                    <span className="font-medium">Return Policy:</span>
                    {product.returnPolicy.isReturnable ? (
                      <span className="text-green-600 ml-2">
                        Returnable within {product.returnPolicy.returnDays} days
                        {product.returnPolicy.returnConditions && (
                          <div className="text-xs text-gray-600 mt-1">
                            Conditions: {product.returnPolicy.returnConditions}
                          </div>
                        )}
                      </span>
                    ) : (
                      <span className="text-red-600 ml-2">Non-returnable</span>
                    )}
                  </div>
                )}
                {!product.returnPolicy && (
                  <div className="col-span-2">
                    <span className="font-medium">Return Policy:</span>
                    <span className="text-red-600 ml-2">Non-returnable</span>
                  </div>
                )}
              </div>
              <p className="text-gray-700">{product.description}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {review.user.firstName[0]}{review.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{review.user.firstName} {review.user.lastName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.feedback && (
                    <p className="text-gray-700 mt-2 ml-13">{review.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this product</p>
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b bg-accent text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm opacity-90">{cartItems?.length || 0} items</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!cartItems || cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-4">Add some products to get started</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex gap-3">
                        <img
                          src={item.product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                          alt={item.product.title}
                          className="w-15 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                          <p className="text-xs text-gray-600">{item.product.category}</p>
                          <div className="text-sm">
                            {siteSettings.globalDiscount > 0 ? (
                              <>
                                <p className="font-bold text-red-600">₹{getDiscountedPrice(item.product.price || 0).toLocaleString('en-IN')}</p>
                                <p className="text-xs text-gray-500 line-through">₹{item.product.price?.toLocaleString('en-IN')}</p>
                              </>
                            ) : (
                              <p className="font-bold text-accent">₹{item.product.price?.toLocaleString('en-IN')}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition"
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-200 transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-200 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-sm font-semibold">
                          ₹{(getDiscountedPrice(item.product.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems && cartItems.length > 0 && (
              <div className="border-t bg-gray-50 p-4 space-y-3">
                <div className="space-y-2 text-sm">
                  {/* Original Amount */}
                  {siteSettings.globalDiscount > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Original Amount:</span>
                      <span className="line-through">₹{cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Discount */}
                  {siteSettings.globalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({siteSettings.discountType === 'percentage' ? `${siteSettings.globalDiscount}%` : `₹${siteSettings.globalDiscount}`}):</span>
                      <span>-₹{(cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) - cartItems.reduce((sum, item) => sum + (getDiscountedPrice(item.product?.price || 0) * item.quantity), 0)).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Subtotal:</span>
                    <span>₹{cartItems.reduce((sum, item) => sum + (getDiscountedPrice(item.product?.price || 0) * item.quantity), 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;