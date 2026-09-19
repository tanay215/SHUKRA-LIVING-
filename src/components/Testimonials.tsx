import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Interior Designer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        content: "The craftsmanship is unparalleled. I've used Shukra Living pieces in three of my recent projects and my clients are always thrilled.",
        rating: 5
    },
    {
        name: "Michael Chen",
        role: "Homeowner",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        content: "Absolutely in love with my new dining set. The wood quality is amazing and it was delivered earlier than expected.",
        rating: 5
    },
    {
        name: "Emma Wilson",
        role: "Architect",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        content: "Minimalist perfection. It's rare to find furniture that balances aesthetics and functionality so well.",
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-cream relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h4 className="text-olive font-medium tracking-[0.2em] uppercase text-xs mb-3">Testimonials</h4>
                    <h2 className="text-4xl font-heading font-bold text-primary">Words from our <span className="italic font-light text-accent">Clients</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-olive text-white p-10 rounded-[2rem] relative group hover:transform hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-olive/20">
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />

                            <div className="flex gap-1 mb-6 text-accent">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-lg font-light leading-relaxed mb-8 text-gray-200">"{item.content}"</p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                                />
                                <div>
                                    <h5 className="font-heading font-bold text-white text-sm tracking-wide">{item.name}</h5>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
