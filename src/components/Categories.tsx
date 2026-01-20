import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AuthUtils } from '../utils/auth';
import axios from 'axios';

interface CategoriesProps {
    addToCart?: (product: any) => void;
}

const categories = [
    { id: 'all', label: 'All' },
    { id: 'living', label: 'Living Room' },
    { id: 'dining', label: 'Dining' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'office', label: 'Home Office' }
];

const API_BASE_URL = 'http://localhost:30011/api';

const Categories: React.FC<CategoriesProps> = ({ addToCart }) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/products`);
                if (response.data && response.data.products) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products for categories", error);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(product =>
            product.category && product.category.toLowerCase().includes(
                activeCategory === 'office' ? 'office' : activeCategory
            )
        );

    const displayProducts = filteredProducts.slice(0, 4);

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h4 className="text-accent/80 font-sans font-medium tracking-[0.2em] uppercase text-xs mb-4">Our Collection</h4>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Curated Categories</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-5 py-2 rounded-full text-[10px] md:text-xs tracking-widest uppercase transition-all duration-300 border ${activeCategory === category.id
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-transparent text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary'
                                    }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {displayProducts.map((product) => {
                        // Override specifically for the watermarked image
                        const displayImage = product.title && product.title.includes("White Marble Dining Table")
                            ? "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800&auto=format&fit=crop"
                            : (product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400');

                        return (
                            <div key={product._id} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                                <div className="relative overflow-hidden mb-6 bg-gray-100 aspect-[3/4]">
                                    <img
                                        src={displayImage}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (addToCart) {
                                                addToCart(product);
                                            } else if (!AuthUtils.isAuthenticated()) {
                                                navigate('/login');
                                            } else {
                                                alert("Please add to cart from the collection page or product details.");
                                            }
                                        }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-primary px-8 py-3 min-w-[140px] text-xs font-bold uppercase tracking-widest transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:text-white shadow-lg"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-serif text-primary group-hover:text-accent transition-colors duration-300">{product.title}</h3>
                                        <p className="text-xs text-secondary tracking-wide">₹{(product.price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-primary/50 group-hover:border-accent group-hover:text-accent transition-all duration-300">
                                        <ArrowUpRight strokeWidth={1} className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {displayProducts.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-400 font-light text-sm tracking-wide">No products found in this category.</p>
                        </div>
                    )}
                </div>

                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/collection')}
                        className="inline-block border-b border-primary pb-1 text-primary text-xs tracking-[0.2em] uppercase hover:text-accent hover:border-accent transition-all duration-300"
                    >
                        View All Categories
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Categories;
