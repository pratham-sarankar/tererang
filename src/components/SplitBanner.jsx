import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import traditionalImg from '../assets/banner_1.jpeg';
import modernImg from '../assets/banner_2.jpeg';

const SplitBanner = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-[600px] flex flex-col md:flex-row overflow-hidden font-poppins">
            {/* Left Image Section - Traditional */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative group overflow-hidden">
                <img
                    src={traditionalImg}
                    alt="Traditional Ethnic Wear"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent group-hover:bg-black/20 transition-colors duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <p className="text-sm uppercase tracking-widest mb-1">Tererang</p>
                    <h3 className="text-2xl font-semibold">Wedding Collection</h3>
                </div>
            </div>

            {/* Right Image Section - Modern */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative group overflow-hidden">
                <img
                    src={modernImg}
                    alt="Modern Ethnic Fusion"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent group-hover:bg-black/20 transition-colors duration-500"></div>
                <div className="absolute bottom-8 right-8 text-right text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <p className="text-sm uppercase tracking-widest mb-1">Contemporary</p>
                    <h3 className="text-2xl font-semibold">Modern Fusion</h3>
                </div>
            </div>

            {/* Center Overlay Card */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[500px] z-20">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 text-center rounded-sm shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 transition-all duration-300 group">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-xl tracking-tight leading-tight">
                        Tererang
                    </h2>
                    <p className="text-gray-100 text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-md">
                        Celebrate timeless elegance with a contemporary edge
                    </p>

                    <button
                        onClick={() => {
                            const element = document.getElementById('latest-collection');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="relative inline-flex items-center justify-center px-10 py-4 bg-white text-black font-semibold text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Explore Collection
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gray-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitBanner;
