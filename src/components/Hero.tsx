import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
    user?: { firstName: string, lastName: string };
}

const Hero: React.FC<HeroProps> = ({ user }) => {
    return (
        <section className="relative w-full min-h-[90vh] bg-primary text-cream flex items-center overflow-hidden">
            {/* Background Image - Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                    alt="Luxury Living Room"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent mix-blend-multiply" />
            </div>

            <div className="absolute inset-0 bg-primary/20 backdrop-brightness-75" />

            <div className="relative z-10 container mx-auto px-6 h-full flex items-center justify-center text-center">
                <div className="max-w-4xl text-white">
                    <h4 className="text-secondary font-medium tracking-[0.2em] uppercase text-xs mb-4 animate-fade-in">
                        {user ? `Welcome Back, ${user.firstName} ` : 'Elevate Your Living'}
                    </h4>
                    <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-8 animate-slide-up">
                        {user ? 'Curated Just For You' : 'Timeless Design for Modern Living'}
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                        Discover bespoke furniture designed to bring elegance and comfort to your living space. Handcrafted for those who appreciate the finer details.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/collection" className="group bg-accent hover:bg-white hover:text-primary text-white px-10 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-3 font-medium tracking-wide shadow-lg shadow-accent/20">
                            SHOP COLLECTION
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
