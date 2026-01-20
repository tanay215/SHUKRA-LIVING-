import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { AuthUtils } from '../utils/auth';
import axios from 'axios';

interface HeaderProps {
    onOpenCart?: () => void;
    cartCount?: number;
    user?: any;
}

const API_BASE_URL = 'http://localhost:30011/api';

const Header: React.FC<HeaderProps> = ({ onOpenCart, cartCount, user }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!user || AuthUtils.isAuthenticated());

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Profile Menu State
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close profile menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsAuthenticated(!!user || AuthUtils.isAuthenticated());
    }, [user]);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Search Debounce Effect
    const performSearch = async (query: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=5`);
            if (response.data && response.data.products) {
                setSearchResults(response.data.products);
            }
        } catch (error) {
            console.error("Search failed", error);
        }
    };


    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleLogout = () => {
        AuthUtils.clearAuth();
        setIsAuthenticated(false);
        navigate('/');
        window.location.reload();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            navigate(`/collection?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="fixed w-full top-0 z-50 bg-cream/80 backdrop-blur-md transition-all duration-300">
            {/* Announcement Bar */}
            <div className="bg-accent/10 text-primary py-2 text-center text-[10px] uppercase tracking-[0.2em] font-medium border-b border-accent/20">
                Free Delivery on Orders Above ₹50,000
            </div>

            <div className="container mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-primary hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu strokeWidth={1} className="w-6 h-6" />
                </button>

                {/* Logo */}
                <Link to="/" className="text-2xl font-serif font-bold text-primary tracking-widest uppercase">
                    Shukra
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-12">
                    {['Home', 'Collection', 'Contact'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className="text-primary hover:text-accent transition-colors text-xs font-normal tracking-[0.15em] uppercase relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                {/* Icons */}
                <div className="flex items-center gap-6 md:gap-8">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="text-primary hover:text-accent transition-colors"
                    >
                        <Search strokeWidth={1} className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onOpenCart || (() => navigate('/cart'))}
                        className="text-primary hover:text-accent transition-colors relative"
                    >
                        <ShoppingBag strokeWidth={1} className="w-5 h-5" />
                        {(cartCount || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="text-primary hover:text-accent transition-colors"
                            >
                                <User strokeWidth={1} className="w-5 h-5" />
                            </button>
                            {isProfileMenuOpen && (
                                <div className="absolute top-full right-0 mt-4 w-48 bg-white shadow-xl border border-gray-100 py-2 animate-fade-in rounded-sm">
                                    <Link to="/profile" className="block px-4 py-2 text-xs uppercase tracking-wider hover:bg-gray-50 text-gray-600">Profile</Link>
                                    <Link to="/orders" className="block px-4 py-2 text-xs uppercase tracking-wider hover:bg-gray-50 text-gray-600">Orders</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-xs uppercase tracking-wider hover:bg-gray-50 text-red-500">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="text-primary hover:text-accent transition-colors">
                            <User strokeWidth={1} className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-cream z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-6 right-6 text-primary"
                    >
                        <X strokeWidth={1} className="w-8 h-8" />
                    </button>
                    {['Home', 'Collection', 'Contact'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                </div>
            )}

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col animate-fade-in">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex justify-end">
                            <button onClick={() => setIsSearchOpen(false)} className="text-primary hover:text-accent">
                                <X strokeWidth={1} className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="mt-20 max-w-3xl mx-auto">
                            <form onSubmit={handleSearchSubmit} className="relative border-b border-primary/20">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-transparent border-none text-4xl font-serif text-primary focus:ring-0 px-0 py-4 placeholder:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-accent">
                                    <ArrowRight strokeWidth={1} className="w-8 h-8" />
                                </button>
                            </form>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {searchResults.map(product => (
                                        <Link
                                            key={product._id}
                                            to={`/product/${product._id}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="flex gap-4 group"
                                        >
                                            <div className="w-20 h-24 bg-gray-100 overflow-hidden">
                                                <img src={product.images?.[0]?.url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-serif text-lg text-primary group-hover:text-accent transition-colors">{product.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
