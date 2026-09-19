import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-cream pt-24 pb-8 border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="space-y-6">
                        <h5 className="font-heading font-bold text-lg text-secondary">About Us</h5>
                        <p className="text-gray-400 font-light leading-relaxed text-sm">
                            Curating timeless furniture pieces that blend Japanese minimalism with Scandinavian functionality. Crafting sanctuaries of peace since 2024.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-heading font-bold text-lg mb-6 text-secondary">Explore</h5>
                        <ul className="space-y-4 text-gray-400 font-light text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Collection</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Designers</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Philosophy</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Journal</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-heading font-bold text-lg mb-6 text-secondary">Support</h5>
                        <ul className="space-y-4 text-gray-400 font-light text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>FAQ</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Care Guide</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-accent transition-all"></span>Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-heading font-bold text-lg mb-6 text-secondary">Newsletter</h5>
                        <p className="text-sm text-gray-400 mb-4 font-light">Subscribe for exclusive offers and design inspiration.</p>
                        <div className="flex mb-8">
                            <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 rounded-l-md px-4 py-2 text-sm text-white focus:outline-none focus:border-accent w-full font-light" />
                            <button className="bg-accent text-white px-4 py-2 rounded-r-md hover:bg-white hover:text-primary transition-colors text-xs font-bold tracking-widest uppercase">Join</button>
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-light mb-16">
                    <p>&copy; 2024 Shukra Living. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>

                {/* Large Typography */}
                <div className="border-t border-white/5 pt-12 flex justify-center overflow-hidden">
                    <h1 className="text-[13vw] leading-none font-bold font-heading text-white/5 select-none tracking-tight whitespace-nowrap">
                        SHUKRA LIVING
                    </h1>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
