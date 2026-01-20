import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col relative font-body bg-white text-gray-900">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-accent/20">
        <div className="bg-accent text-white text-xs text-center py-2 tracking-widest font-body font-bold">
          FREE DELIVERY ON ORDERS ABOVE ₹50,000 | 1 YEAR WARRANTY
        </div>
        
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-3xl font-heading font-bold text-accent tracking-tight cursor-pointer">
            SHUKRA LIVING
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-accent text-white px-6 py-2 rounded-full font-bold hover:bg-accent/90 transition"
            >
              LOGIN
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="relative h-[600px] w-full">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white leading-tight max-w-3xl drop-shadow-lg">
              TIMELESS <span className="text-accent">ELEGANCE</span> <br/> FOR YOUR HOME
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 font-body max-w-lg border-l-4 border-accent pl-6">
              Discover handcrafted luxury furniture and décor that transforms your space into a masterpiece.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="mt-8 bg-accent text-white px-10 py-4 rounded-full font-body tracking-widest hover:bg-white hover:text-accent transition shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              GET STARTED <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>
      
      <footer className="bg-accent text-white py-16 font-body text-sm">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="text-3xl font-heading font-bold mb-4">SHUKRA</h4>
            <p className="opacity-90">Luxury is in each detail.</p>
          </div>
          <div>
             <h5 className="font-bold mb-4 text-lg">Links</h5>
             <ul className="space-y-2 opacity-90">
               <li>About Us</li>
               <li>Collections</li>
               <li>Contact</li>
             </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-lg">Newsletter</h5>
            <div className="flex border-b border-white pb-2">
              <input placeholder="Your Email" className="bg-transparent placeholder-white/70 outline-none w-full" />
              <button>JOIN</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;