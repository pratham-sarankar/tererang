import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import traditionalImg from '../assets/banner_1.jpeg';
import modernImg from '../assets/banner_2.jpeg';

const slides = [
    { img: traditionalImg, alt: 'Wedding Collection', label: 'Wedding Collection' },
    { img: modernImg, alt: 'Modern Ethnic Fusion', label: 'Modern Fusion' },
];

const SplitBanner = () => {
    const scrollToCollection = () => {
        document.getElementById('latest-collection')?.scrollIntoView({ behavior: 'smooth' });
    };

    // ── Carousel state ──
    const [active, setActive] = useState(0);
    const touchStartX = useRef(null);
    const timerRef = useRef(null);

    const goTo = (index) => setActive((index + slides.length) % slides.length);

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setActive(prev => (prev + 1) % slides.length), 4000);
    };

    useEffect(() => {
        resetTimer();
        return () => clearInterval(timerRef.current);
    }, []);

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) { goTo(active + (delta > 0 ? 1 : -1)); resetTimer(); }
        touchStartX.current = null;
    };

    return (
        <>
            {/* ── MOBILE HERO — auto-advancing carousel, shown only below md ── */}
            <div
                className="relative w-full aspect-square md:hidden overflow-hidden font-poppins"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Slides strip — translate by active index */}
                <div
                    className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${active * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
                >
                    {slides.map((slide, i) => (
                        <div key={i} className="relative h-full" style={{ width: `${100 / slides.length}%` }}>
                            <img
                                src={slide.img}
                                alt={slide.alt}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    ))}
                </div>

                {/* Persistent gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Dot indicators */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { goTo(i); resetTimer(); }}
                            className={`h-1 rounded-full transition-all duration-300 ${i === active ? 'bg-white w-6' : 'bg-white/40 w-3'}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Bottom CTA — static, always visible */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-center text-white z-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-pink-300 mb-2 font-medium">
                        New Collection
                    </p>
                    <h1 className="text-5xl font-bold mb-3 leading-tight tracking-tight drop-shadow-xl">
                        Tererang
                    </h1>
                    <p className="text-sm text-gray-200 mb-7 font-light leading-relaxed max-w-xs mx-auto">
                        Celebrate timeless elegance with a contemporary edge
                    </p>
                    <button
                        onClick={scrollToCollection}
                        className="inline-flex items-center gap-2 bg-white text-[#b81582] px-8 py-3.5 font-bold text-xs uppercase tracking-widest hover:bg-pink-50 active:scale-95 transition-all duration-200 shadow-2xl"
                    >
                        Explore Collection
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── DESKTOP HERO — hidden below md ── */}
            <div className="hidden md:flex relative w-full h-[600px] overflow-hidden font-poppins">
                {/* Left Panel */}
                <div className="w-1/2 h-full relative group overflow-hidden">
                    <img
                        src={traditionalImg}
                        alt="Traditional Ethnic Wear"
                        className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <p className="text-sm uppercase tracking-widest mb-1">Tererang</p>
                        <h3 className="text-2xl font-semibold">Wedding Collection</h3>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-1/2 h-full relative group overflow-hidden">
                    <img
                        src={modernImg}
                        alt="Modern Ethnic Fusion"
                        className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute bottom-8 right-8 text-right text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <p className="text-sm uppercase tracking-widest mb-1">Contemporary</p>
                        <h3 className="text-2xl font-semibold">Modern Fusion</h3>
                    </div>
                </div>

                {/* Center Overlay Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] z-20">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center rounded-sm shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 transition-all duration-300 group">
                        <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-xl tracking-tight leading-tight">
                            Tererang
                        </h2>
                        <p className="text-gray-100 text-xl mb-8 font-light tracking-wide drop-shadow-md">
                            Celebrate timeless elegance with a contemporary edge
                        </p>
                        <button
                            onClick={scrollToCollection}
                            className="relative inline-flex items-center justify-center px-10 py-4 bg-white text-black font-semibold text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore Collection
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-gray-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SplitBanner;
