import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import traditionalImg from '../assets/banner_1.jpeg';
import modernImg from '../assets/banner_2.jpeg';

const slides = [
    {
        img: traditionalImg,
        tag: 'handcrafted couture',
        title: 'timeless silhouettes',
        desc: 'reimagined indian couture crafted with bespoke precision and artisanal heritage.',
    },
    {
        img: modernImg,
        tag: 'modern luxury',
        title: 'understated elegance',
        desc: 'contemporary grace woven with love, curated to become an unforgettable part of your story.',
    },
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
        timerRef.current = setInterval(() => setActive(prev => (prev + 1) % slides.length), 5500);
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
        <section className="relative w-full overflow-hidden bg-background">
            {/* ── MOBILE HERO (below md) ── */}
            <div
                className="relative w-full h-[540px] md:hidden overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Slides strip */}
                <div
                    className="absolute inset-0 flex transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-${active * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
                >
                    {slides.map((slide, i) => (
                        <div key={i} className="relative h-full" style={{ width: `${100 / slides.length}%` }}>
                            <img
                                src={slide.img}
                                alt={slide.title}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    ))}
                </div>

                {/* Refined gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 pointer-events-none" />

                {/* Dot indicators */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { goTo(i); resetTimer(); }}
                            className={`h-[2px] transition-all duration-300 ${i === active ? 'bg-white w-6' : 'bg-white/40 w-3'}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Bottom CTA content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 text-center text-white z-10">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-medium mb-2">
                        {slides[active].tag}
                    </p>
                    <h1 className="text-4xl font-serif lowercase mb-3 tracking-wide leading-tight">
                        {slides[active].title}
                    </h1>
                    <p className="text-xs text-white/80 font-light leading-relaxed max-w-xs mx-auto mb-6">
                        {slides[active].desc}
                    </p>
                    <button
                        onClick={scrollToCollection}
                        className="inline-flex items-center gap-2 border border-white/80 bg-white/10 backdrop-blur-sm text-white px-7 py-3 text-xs lowercase tracking-widest hover:bg-white hover:text-foreground transition-all duration-300"
                    >
                        <span>explore collection</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ── DESKTOP HERO (md and above) ── */}
            <div className="hidden md:flex relative w-full h-[640px] lg:h-[720px] overflow-hidden">
                {/* Left Panel */}
                <div className="w-1/2 h-full relative group overflow-hidden cursor-pointer" onClick={scrollToCollection}>
                    <img
                        src={traditionalImg}
                        alt="Wedding Collection"
                        className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-500" />
                    <div className="absolute bottom-10 left-10 text-white z-10">
                        <p className="text-xs uppercase tracking-[0.25em] text-accent font-light mb-1">bespoke collection</p>
                        <h3 className="text-3xl font-serif lowercase tracking-wide">wedding & couture</h3>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-1/2 h-full relative group overflow-hidden cursor-pointer" onClick={scrollToCollection}>
                    <img
                        src={modernImg}
                        alt="Modern Ethnic Fusion"
                        className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-500" />
                    <div className="absolute bottom-10 right-10 text-right text-white z-10">
                        <p className="text-xs uppercase tracking-[0.25em] text-accent font-light mb-1">everyday luxury</p>
                        <h3 className="text-3xl font-serif lowercase tracking-wide">modern fusion</h3>
                    </div>
                </div>

                {/* Center Editorial Plaque */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] z-20 pointer-events-none">
                    <div className="bg-card/95 backdrop-blur-md border border-border p-10 lg:p-12 text-center rounded-sm shadow-xl pointer-events-auto">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3 font-medium">
                            moradabad atelier
                        </p>
                        <h2 className="text-4xl lg:text-5xl font-serif lowercase text-foreground mb-4 tracking-wide">
                            tererang
                        </h2>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed mb-8 italic font-serif">
                            "curated with love. crafted with purpose. designed to become part of your story."
                        </p>
                        <button
                            onClick={scrollToCollection}
                            className="inline-flex items-center gap-2.5 border-2 border-primary text-foreground px-8 py-3.5 lowercase tracking-widest text-xs font-medium hover:bg-primary hover:text-white transition-all duration-300"
                        >
                            <span>explore collection</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SplitBanner;
