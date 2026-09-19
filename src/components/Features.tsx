import React from 'react';
import { Award, PenTool, Tag, Truck, Shield } from 'lucide-react';

const features = [
    { icon: Award, title: "Premium Craftsmanship", desc: "Expertly detailed" },
    { icon: PenTool, title: "Custom-Made", desc: "Built for you" },
    { icon: Tag, title: "Affordable Luxury", desc: "Direct to consumer" },
    { icon: Truck, title: "Fast Delivery", desc: "Handled with care" },
    { icon: Shield, title: "Durable Materials", desc: "Built to last" },
];

const Features = () => {
    return (
        <section className="bg-primary text-cream py-16 border-t border-white/5 relative z-20 -mt-2">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-5 p-4 rounded-full border border-white/10 group-hover:border-accent/50 group-hover:bg-accent/10 transition-all duration-300">
                                <feature.icon className="w-8 h-8 text-secondary group-hover:text-accent transition-colors" strokeWidth={1} />
                            </div>
                            <h3 className="text-xs font-heading font-bold tracking-[0.15em] mb-2 text-white uppercase">{feature.title}</h3>
                            <p className="text-xs text-gray-400 font-light tracking-wide">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
