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

    // Limit to 4 products for the home page display if filtered list is too long?
    // The user didn't ask to limit, but the design shows a grid of 4. 
    // Usually "Curated Categories" shows a subset. 
    // I will show up to 8 items to keep it clean but populate the grid. 
    // Actually the image shows 4. Let's stick to 4 or 8.
    // The previous hardcoded list had 4. I'll slice(0, 4) to maintain the layout unless the user clicks "View All".
    // Wait, the "View All Categories" button implies there's more.
    // I'll show 4 items per category for this section.

    const displayProducts = filteredProducts.slice(0, 4);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h4 className="text-secondary font-medium tracking-[0.2em] uppercase text-xs mb-2">Our Collection</h4>
                        <h2 className="text-4xl font-heading font-bold text-primary">Curated Categories</h2>
                    </div>
                    <div className="hidden md:flex gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${activeCategory === category.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.map((product) => (
                        <div key={product._id} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-6">
                                <img
                                    src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400'}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (addToCart) {
                                                addToCart(product);
                                            } else if (!AuthUtils.isAuthenticated()) {
                                                navigate('/login');
                                            } else {
                                                // Fallback if addToCart prop isn't passed but user is logged in
                                                // We might need to manually add to cart here or alert
                                                alert("Please add to cart from the collection page or product details.");
                                            }
                                        }}
                                        className="bg-white text-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent hover:text-white"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-heading font-medium text-primary mb-1">{product.title}</h3>
                                    <p className="text-sm text-gray-500">₹{(product.price || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {displayProducts.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            No products found in this category.
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <button className="text-primary border-b border-primary pb-1 text-xs tracking-widest uppercase font-medium" onClick={() => navigate('/collection')}>View All Categories</button>
                </div>
            </div>
        </section>
    );
};

export default Categories;
