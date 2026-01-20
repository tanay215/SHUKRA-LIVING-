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
        <section className="bg-primary text-cream py-24 border-t border-white/5 relative z-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-6 p-5 rounded-full border border-white/5 group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-500">
                                <feature.icon
                                    className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors duration-300"
                                    strokeWidth={0.75}
                                />
                            </div>
                            <h3 className="text-xs font-serif font-medium tracking-[0.15em] mb-3 text-white uppercase group-hover:text-accent transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-xs text-gray-400 font-light tracking-wide leading-relaxed max-w-[150px]">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
