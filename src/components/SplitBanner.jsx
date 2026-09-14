import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "./storefrontData.js";

const SplitBanner = () => {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  const scrollToCollection = () => {
    document.getElementById("latest-collection")?.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (index) => setActive((index + heroSlides.length) % heroSlides.length);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((prev) => (prev + 1) % heroSlides.length), 5600);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goTo(active + (delta > 0 ? 1 : -1));
      resetTimer();
    }
    touchStartX.current = null;
  };

  const activeSlide = heroSlides[active];

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className="relative h-[calc(100vh-104px)] min-h-[590px] md:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-${active * (100 / heroSlides.length)}%)`, width: `${heroSlides.length * 100}%` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.title} className="relative h-full" style={{ width: `${100 / heroSlides.length}%` }}>
              <img src={slide.img} alt={slide.title} className="h-full w-full object-cover object-top" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/35 to-black/8" />

        <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.title}
              onClick={() => {
                goTo(index);
                resetTimer();
              }}
              className={`h-0.5 transition-all ${index === active ? "w-8 bg-white" : "w-4 bg-white/45"}`}
              aria-label={`Go to ${slide.title}`}
              type="button"
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent">{activeSlide.tag}</p>
          <h1 className="mx-auto mt-3 max-w-sm font-serif text-5xl lowercase leading-none">{activeSlide.title}</h1>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/82">{activeSlide.desc}</p>
          <button
            type="button"
            onClick={scrollToCollection}
            className="mt-7 inline-flex items-center gap-2 border border-white/75 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-foreground"
          >
            {activeSlide.cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="hidden min-h-[680px] grid-cols-3 md:grid">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={scrollToCollection}
            onMouseEnter={() => setActive(index)}
            className="group relative min-h-[680px] overflow-hidden text-left"
          >
            <img src={slide.img} alt={slide.title} className="absolute inset-0 h-full w-full object-cover object-top transition duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/28 transition group-hover:bg-black/18" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white lg:p-10">
              <p className="text-xs font-semibold tracking-[0.08em] text-accent">{slide.tag}</p>
              <h2 className="mt-3 max-w-xs font-serif text-4xl lowercase leading-none lg:text-5xl">{slide.title}</h2>
            </div>
          </button>
        ))}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(520px,42vw)] -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-auto border border-border bg-card/94 p-10 text-center shadow-[0_24px_80px_rgba(44,40,37,0.16)] backdrop-blur-md lg:p-12">
            <p className="text-xs font-semibold tracking-[0.08em] text-accent">Moradabad atelier</p>
            <h1 className="mt-3 font-serif text-6xl lowercase leading-none text-foreground lg:text-7xl">tererang</h1>
            <p className="mx-auto mt-5 max-w-sm font-serif text-lg italic leading-8 text-muted-foreground">
              Curated with love. Crafted with purpose. Designed to become part of your story.
            </p>
            <button
              onClick={scrollToCollection}
              type="button"
              className="mt-8 inline-flex items-center gap-2 border border-primary px-8 py-3.5 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white"
            >
              explore collection
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitBanner;
