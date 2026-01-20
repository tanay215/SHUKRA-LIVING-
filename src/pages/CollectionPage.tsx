import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShoppingBag, X, Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:30011/api';

const categories = [
    { id: 'living', label: 'Living Room', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop' },
    { id: 'dining', label: 'Dining Room', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=2000&auto=format&fit=crop' },
    { id: 'bedroom', label: 'Bedroom', image: 'https://images.unsplash.com/photo-1505693416388-3343d41298ed?q=80&w=2000&auto=format&fit=crop' },
    { id: 'office', label: 'Home Office', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2000&auto=format&fit=crop' }
];

const CollectionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<any[]>(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            return [];
        }
    });

    // Auth State
    const [auth, setAuth] = useState({
        user: null as any,
        token: AuthUtils.getToken(),
        isAuthenticated: AuthUtils.isAuthenticated()
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [siteSettings, setSiteSettings] = useState({
        freeDeliveryThreshold: 50000,
        deliveryCharge: 500,
        globalDiscount: 0,
        discountType: 'percentage'
    });

    useEffect(() => {
        loadUserProfile();
        loadProducts();
        loadSiteSettings();
    }, [location.search]);

    const loadSiteSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            setSiteSettings(response.data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const loadUserProfile = async () => {
        const token = AuthUtils.getToken();
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAuth({ user: response.data, token, isAuthenticated: true });
            } catch (error) {
                console.error('Failed to load profile');
            }
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const searchParams = new URLSearchParams(location.search);
            const query = searchParams.get('search');

            let url = `${API_BASE_URL}/products`;
            if (query) {
                console.log('Searching for:', query);
                url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
            }

            const response = await axios.get(url);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            // Fallback to empty if API fails
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any) => {
        if (!AuthUtils.isAuthenticated()) {
            navigate('/login');
            return;
        }

        const currentCart = [...cartItems];
        const existingItem = currentCart.find(item => item.product._id === product._id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentCart.push({ product, quantity: 1 });
        }

        setCartItems(currentCart);
        localStorage.setItem('cartItems', JSON.stringify(currentCart));
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

    const cartTotal = cartItems.reduce((sum, item) => {
        const price = getDiscountedPrice(item.product?.price || 0);
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    const getDeliveryCharge = (total: number) => {
        return total >= siteSettings.freeDeliveryThreshold ? 0 : siteSettings.deliveryCharge;
    };

    // Group products by category
    const getProductsByCategory = (catId: string) => {
        return products.filter(p => p.category?.toLowerCase().includes(catId));
    };

    return (
        <div className="bg-cream min-h-screen font-sans">
            <Header
                cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                onOpenCart={() => setIsCartOpen(true)}
                user={auth.user}
            />

            {/* Hero Section */}
            <section className="relative h-[40vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop"
                        alt="Collection Hero"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/40" />
                </div>
                <div className="relative z-10 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 tracking-tight">The Collection</h1>
                    <p className="text-lg font-light tracking-wide max-w-2xl mx-auto">Curated pieces for every corner of your home.</p>
                </div>
            </section>

            {/* Categories Grid */}
            <div className="container mx-auto px-6 py-20 space-y-32">
                {categories.map((category, index) => {
                    const categoryProducts = getProductsByCategory(category.id);
                    if (categoryProducts.length === 0 && loading) return null;

                    return (
                        <section key={category.id} id={category.id} className="scroll-mt-32">
                            <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-primary/10 pb-6">
                                <div>
                                    <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-2 block">0{index + 1}</span>
                                    <h2 className="text-4xl font-heading font-bold text-primary">{category.label}</h2>
                                </div>
                                <button className="hidden md:flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium tracking-widest uppercase">
                                    View All {category.label} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {categoryProducts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {categoryProducts.map((product) => (
                                        <div key={product._id} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-100 mb-6">
                                                <img
                                                    src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(product);
                                                        }}
                                                        className="w-full bg-white text-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors shadow-lg"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-heading font-medium text-primary">{product.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">₹{(product.price || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-white/50 rounded-lg">
                                    <p className="text-gray-400 font-light">New additions coming soon to {category.label}.</p>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

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

export default CollectionPage;
