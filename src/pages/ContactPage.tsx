import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { AuthUtils } from '../utils/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:30011/api';

const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [auth, setAuth] = useState({
        user: null as any,
        token: AuthUtils.getToken(),
        isAuthenticated: AuthUtils.isAuthenticated()
    });

    // Minimal cart state just to pass to Header
    const [cartItems, setCartItems] = useState<any[]>(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
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
        loadUserProfile();
    }, []);

    return (
        <div className="h-screen overflow-hidden bg-primary flex flex-col">
            <Header
                cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                onOpenCart={() => navigate('/cart')}
                user={auth.user}
            />

            {/* Main Contact Section - Taking remaining height */}
            <main className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Background Image - Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent mix-blend-multiply" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">

                    {/* Left Text */}
                    <div className="text-white hidden lg:block">
                        <h4 className="text-secondary font-medium tracking-[0.2em] uppercase text-xs mb-4">
                            Contact Us
                        </h4>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-8">
                            Let's Create Your Dream Space
                        </h1>
                        <p className="text-lg text-gray-300 max-w-lg font-light leading-relaxed">
                            Have a question about our collections or need personalized design advice? Our team is here to help you craft the perfect living environment.
                        </p>
                    </div>

                    {/* Right Form - Centered on mobile */}
                    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                        <div className="bg-primary/40 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                            {/* Decorative sheen */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

                            <div className="mb-6">
                                <h3 className="text-2xl font-heading font-bold text-white mb-2">Get in Touch</h3>
                                <p className="text-sm text-gray-300">We'd love to hear from you.</p>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);
                                const data = {
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    message: formData.get('message')
                                };

                                try {
                                    await axios.post(`${API_BASE_URL}/contacts`, data);
                                    alert('Message sent successfully! We will get back to you soon.');
                                    form.reset();
                                } catch (error) {
                                    alert('Failed to send message. Please try again.');
                                }
                            }} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={3}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light resize-none"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-secondary text-primary hover:bg-white hover:shadow-lg hover:shadow-white/10 font-bold py-4 rounded-lg transition-all duration-300 tracking-widest uppercase text-sm mt-2">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
