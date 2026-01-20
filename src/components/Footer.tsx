import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <section className="bg-primary text-cream pt-24 pb-8 border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-24">
                    <div className="space-y-6">
                        <h5 className="font-serif text-lg text-white tracking-wide">About Shukra</h5>
                        <p className="text-gray-400 font-light leading-relaxed text-sm max-w-xs">
                            Curating timeless furniture pieces that blend Japanese minimalism with Scandinavian functionality. Crafting sanctuaries of peace since 2024.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-serif text-lg mb-6 text-white tracking-wide">Explore</h5>
                        <ul className="space-y-4 text-gray-400 font-light text-sm">
                            {['Collection', 'Designers', 'Philosophy', 'Journal'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group w-fit">
                                        <span className="w-0 group-hover:w-3 h-px bg-accent transition-all duration-300"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-serif text-lg mb-6 text-white tracking-wide">Support</h5>
                        <ul className="space-y-4 text-gray-400 font-light text-sm">
                            {['FAQ', 'Shipping & Returns', 'Care Guide', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-accent transition-colors flex items-center gap-2 group w-fit">
                                        <span className="w-0 group-hover:w-3 h-px bg-accent transition-all duration-300"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-serif text-lg mb-6 text-white tracking-wide">Newsletter</h5>
                        <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">Subscribe for exclusive offers and design inspiration.</p>
                        <div className="flex mb-8">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-white/5 border-b border-white/20 rounded-none px-0 py-2 text-sm text-white focus:outline-none focus:border-accent w-full font-light placeholder:text-white/20 transition-colors"
                            />
                            <button className="text-accent hover:text-white transition-colors text-xs font-bold tracking-widest uppercase ml-4 border-b border-transparent hover:border-white">
                                Join
                            </button>
                        </div>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all duration-300 text-gray-400">
                                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-light mb-16 tracking-wide">
                    <p>&copy; 2024 Shukra Living. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
                    </div>
                </div>

                {/* Large Typography */}
                <div className="pt-12 flex justify-center overflow-hidden w-full select-none pointer-events-none">
                    <h1 className="text-[14vw] leading-none font-serif text-white/5 tracking-tight whitespace-nowrap">
                        SHUKRA LIVING
                    </h1>
                </div>
            </div>
        </section>
    );
};

export default Footer;
