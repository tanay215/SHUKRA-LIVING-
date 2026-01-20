import { useState, useEffect } from 'react';
import axios from 'axios';

const Philosophy = () => {
    const [philosophy, setPhilosophy] = useState({
        title: 'Design that Breathes Life',
        content: 'We believe that furniture should be more than just functional. It should be an expression of your lifestyle, a reflection of your taste, and a source of comfort.',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('http://localhost:30011/api/settings');
                if (response.data?.philosophy) {
                    setPhilosophy(prev => ({
                        ...prev,
                        ...response.data.philosophy,
                        // Ensure we don't end up with undefined
                        title: response.data.philosophy.title || prev.title,
                        content: response.data.philosophy.content || prev.content,
                        imageUrl: response.data.philosophy.imageUrl || prev.imageUrl
                    }));
                }
            } catch (error) {
                console.error('Failed to load philosophy:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <section className="bg-cream text-primary py-32">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-32">
                    {/* Arch Image */}
                    <div className="w-full md:w-1/2 relative">
                        <div className="relative z-10 overflow-hidden rounded-t-[500px] h-[600px] w-full max-w-md mx-auto shadow-2xl">
                            <img
                                src={philosophy.imageUrl}
                                alt="Philosophy"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                            />
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 border border-accent rounded-full -z-0 hidden md:block opacity-50"></div>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-1/2 space-y-10">
                        <div>
                            <h4 className="text-secondary font-sans font-medium tracking-[0.25em] uppercase text-xs mb-4">Our Philosophy</h4>
                            <h2 className="text-5xl lg:text-6xl font-serif text-primary leading-tight">
                                {philosophy.title}
                            </h2>
                            <div className="w-24 h-px bg-accent mt-8 mb-8"></div>
                        </div>

                        <p className="text-secondary leading-loose font-normal text-lg md:text-xl whitespace-pre-wrap max-w-xl">
                            {philosophy.content}
                        </p>

                        <button className="text-primary hover:text-accent font-medium tracking-[0.2em] uppercase text-xs transition-colors border-b border-primary hover:border-accent pb-1 pt-4">
                            Read Our Story
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Philosophy;
