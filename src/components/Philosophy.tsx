import React from 'react';

const Philosophy = () => {
    return (
        <section className="bg-cream text-primary py-24">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
                    {/* Image */}
                    <div className="w-full md:w-1/2 relative group">
                        <div className="absolute inset-0 bg-secondary/30 rounded-t-full rounded-b-none transform translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
                        <div className="relative z-10 overflow-hidden rounded-t-full rounded-b-none shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop"
                                alt="Minimalist Interior"
                                className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <h4 className="text-olive font-medium tracking-[0.2em] uppercase text-xs">Our Philosophy</h4>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
                            Design that <br />
                            <span className="italic font-light text-secondary">Breathes Life</span>
                        </h2>
                        <div className="w-20 h-0.5 bg-accent"></div>
                        <p className="text-gray-600 leading-loose font-light text-lg">
                            We believe that furniture should be more than just functional. It should be an expression of your lifestyle, a reflection of your taste, and a source of comfort. Our designs are rooted in the principles of <span className="text-primary font-medium">"Japandi"</span> – a harmonious blend of Japanese rustic minimalism and Scandinavian functionality.
                        </p>
                        <p className="text-gray-600 leading-loose font-light text-lg">
                            Every piece is crafted with sustainable materials and timeless aesthetics, ensuring that your home remains a sanctuary of peace and beauty for years to come.
                        </p>
                        <button className="group flex items-center gap-2 text-primary hover:text-accent font-medium tracking-widest uppercase text-xs mt-6 transition-all">
                            <span className="border-b border-primary group-hover:border-accent pb-1">Read Our Story</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Philosophy;
