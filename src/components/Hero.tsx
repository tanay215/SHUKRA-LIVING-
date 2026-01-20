import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop"
                    alt="Luxury Living Room"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for text readability */}
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center text-white">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <h4 className="font-sans font-medium tracking-[0.3em] uppercase text-xs or md:text-sm mb-6 animate-fade-in text-cream drop-shadow-md">
                        Exclusively at Shukra Living
                    </h4>
                    <h1 className="text-6xl md:text-8xl font-serif font-medium leading-tiny mb-8 animate-slide-up drop-shadow-lg">
                        Curated Just For You
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow-md">
                        Experience the harmony of form and function. Timeless furniture designed to elevate your everyday living.
                    </p>
                    <div>
                        <Link to="/collection" className="inline-block bg-accent hover:bg-white hover:text-primary text-white px-12 py-4 rounded-full transition-all duration-500 font-medium tracking-widest uppercase text-xs shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Shop Collection
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
