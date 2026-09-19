import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, X, LogIn, LogOut, ArrowRight, Loader } from 'lucide-react';
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
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsAuthenticated(!!user || AuthUtils.isAuthenticated());
    }, [user]);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Search Debounce Effect
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

    const performSearch = async (query: string) => {
        try {
            setIsSearching(true);
            // Using the search endpoint we confirmed exists
            const response = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=5`);
            if (response.data && response.data.products) {
                setSearchResults(response.data.products);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

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
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-[#2A1F17] text-[#E5D3B3] py-2 text-center text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                Free Delivery on Orders Above ₹35,000
            </div>

            {/* Main Header */}
            <div className="bg-cream/90 backdrop-blur-md border-b border-secondary/20 transition-all duration-200 relative">
                <div className="container mx-auto px-6 py-5 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-heading font-bold text-primary tracking-widest">
                        SHUKRA LIVING
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-10">
                        {['HOME', 'COLLECTION', 'CONTACT'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                className="text-primary hover:text-accent transition-colors font-medium text-xs tracking-widest"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-6">
                        <button
                            aria-label="Search"
                            className="text-primary hover:text-accent transition-colors"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onOpenCart || (() => navigate('/cart'))}
                            aria-label="Cart"
                            className="text-primary hover:text-accent transition-colors relative"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {(cartCount || 0) > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link to="/profile" aria-label="Profile" className="text-primary hover:text-accent transition-colors">
                                    <User className="w-5 h-5" />
                                </Link>
                                <button onClick={handleLogout} className="text-primary hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium text-xs tracking-widest border border-primary/20 px-4 py-2 rounded-full hover:border-accent">
                                <LogIn className="w-4 h-4" />
                                LOGIN
                            </Link>
                        )}

                        <button
                            className="md:hidden text-primary hover:text-accent"
                            aria-label="Menu"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Search Overlay */}
                {isSearchOpen && (
                    <div className="absolute inset-0 z-[60] flex items-center px-6 animate-fade-in h-24 bg-white/95 backdrop-blur-xl border-b border-[#E5D3B3]">
                        <div className="container mx-auto relative flex items-center max-w-4xl">
                            <Search className="w-6 h-6 text-[#8B7355] absolute left-0" />
                            <form onSubmit={handleSearchSubmit} className="w-full">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search for furniture..."
                                    className="w-full bg-transparent border-none text-2xl md:text-3xl font-heading text-[#2A1F17] focus:ring-0 pl-12 pr-12 placeholder:text-[#D4C3A3] placeholder:font-light h-20 tracking-wide"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="absolute right-0 p-2 text-[#8B7355] hover:text-[#2A1F17] transition-colors"
                            >
                                <X className="w-8 h-8 font-light" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Results Dropdown */}
                {isSearchOpen && searchQuery.length > 1 && (
                    <div className="absolute top-24 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#E5D3B3] shadow-2xl z-[55] max-h-[70vh] overflow-y-auto">
                        <div className="container mx-auto py-12 px-6 max-w-6xl">
                            {isSearching ? (
                                <div className="flex flex-col items-center justify-center py-12 text-[#8B7355] gap-4">
                                    <Loader className="w-6 h-6 animate-spin" />
                                    <span className="text-xs tracking-[0.3em] uppercase font-light">Searching Collection...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8 border-b border-[#E5D3B3]/30 pb-4">
                                        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B7355]">Found {searchResults.length} Products</h3>
                                        <button
                                            onClick={(e) => handleSearchSubmit(e)}
                                            className="text-[#2A1F17] hover:text-[#C5A265] text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product._id}
                                                className="group cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/product/${product._id}`);
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <div className="overflow-hidden rounded-sm bg-[#F5F5F0] mb-4 aspect-[4/3]">
                                                    <img
                                                        src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/300'}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-heading font-medium text-[#2A1F17] text-lg group-hover:text-[#C5A265] transition-colors">{product.title}</h4>
                                                    <p className="text-xs text-[#8B7355] mt-1 font-light uppercase tracking-wide">{product.category}</p>
                                                    <p className="text-sm font-medium text-[#2A1F17] mt-2">₹{(product.price || 0).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-[#2A1F17] font-heading text-xl">No designs found matching "{searchQuery}"</p>
                                    <p className="text-[#8B7355] mt-2 font-light">Try searching for 'Sofa' or 'Table'</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && !isSearchOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-secondary/20 py-4 px-6 flex flex-col space-y-4 shadow-lg animate-fade-in">
                        {['HOME', 'COLLECTION', 'CONTACT'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                className="text-primary hover:text-accent transition-colors font-medium text-sm tracking-widest uppercase"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="text-primary hover:text-accent transition-colors font-medium text-sm tracking-widest uppercase" onClick={() => setIsMenuOpen(false)}>
                                    Profile
                                </Link>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-500 hover:text-red-600 transition-colors font-medium text-sm tracking-widest uppercase">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-primary hover:text-accent transition-colors font-medium text-sm tracking-widest uppercase" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
