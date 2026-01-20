import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<any[]>([]);

    useEffect(() => {
        // For the high-fidelity UI, we use curated testimonials to ensure 
        // the aesthetic matches the luxury brand identity.
        // In production, this would fetch verified reviews.
        // const fetchTestimonials = async () => { ... }

        setTestimonials([
            {
                user: { firstName: "Sarah", lastName: "Jenkins", profileImage: null },
                role: "Interior Designer",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop", // Updated image
                comment: "The craftsmanship is unparalleled. I've used Shukra Living pieces in three of my recent projects and my clients are always thrilled.",
                rating: 5
            },
            {
                user: { firstName: "Michael", lastName: "Chen", profileImage: null },
                role: "Homeowner",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
                comment: "Absolutely in love with my new dining set. The wood quality is amazing and it was delivered earlier than expected.",
                rating: 5
            },
            {
                user: { firstName: "Emma", lastName: "Wilson", profileImage: null },
                role: "Architect",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
                comment: "Minimalist perfection. It's rare to find furniture that balances aesthetics and functionality so well.",
                rating: 5
            }
        ]);
    }, []);

    return (
        <section className="py-32 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h4 className="text-secondary font-sans font-medium tracking-[0.2em] uppercase text-xs mb-4">Testimonials</h4>
                    <h2 className="text-4xl lg:text-5xl font-serif text-primary">Client <span className="italic text-accent">Stories</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-white p-12 rounded-sm relative group hover:-translate-y-2 transition-transform duration-500 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-gray-100/50">
                            <div className="flex gap-1 mb-6 text-accent">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={14} className="fill-current" />
                                ))}
                            </div>

                            <p className="text-secondary text-lg leading-relaxed mb-8 font-light italic">"{item.comment || item.content}"</p>

                            <div className="flex items-center gap-4 mt-auto">
                                <img
                                    src={item.user?.profileImage || item.image || "https://via.placeholder.com/150"}
                                    alt={item.user?.firstName || item.name}
                                    className="w-10 h-10 rounded-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                                />
                                <div>
                                    <h5 className="font-serif text-primary text-sm font-medium">
                                        {item.user?.firstName} {item.user?.lastName || ''}
                                        {item.name ? item.name : ''}
                                    </h5>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                                        {item.verified ? 'Verified Buyer' : (item.role || 'Customer')}
                                    </p>
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
