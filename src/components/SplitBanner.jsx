import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "./storefrontData.js";

const SplitBanner = () => {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  const goTo = (index) => setActive((index + heroSlides.length) % heroSlides.length);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((prev) => (prev + 1) % heroSlides.length), 6000);
  };

  const handleSlide = (index) => {
    goTo(index);
    resetTimer();
  };

  const scrollToCollection = () => {
    document.getElementById("latest-collection")?.scrollIntoView({ behavior: "smooth" });
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
      handleSlide(active + (delta > 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="group relative h-[68vh] min-h-[520px] overflow-hidden bg-stone-900 sm:h-[72vh] sm:min-h-[560px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {heroSlides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            index === active ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <img
            src={slide.img}
            alt={slide.title}
            className={`h-full w-full object-cover object-top transition-transform duration-[9000ms] ease-out ${
              index === active ? "scale-105" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-black/38 sm:bg-black/32" />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90 drop-shadow-sm sm:text-xs">
          {heroSlides[active].tag}
        </p>
        <h1 className="font-serif text-5xl font-semibold lowercase leading-[0.95] tracking-[0.02em] drop-shadow-md sm:text-6xl lg:text-7xl">
          {heroSlides[active].title.split(" ")[0]}
          <br />
          <span className="font-normal italic text-accent">
            {heroSlides[active].title.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-xs font-semibold uppercase leading-7 tracking-[0.2em] text-white/82 drop-shadow-sm sm:text-sm">
          {heroSlides[active].desc}
        </p>
        <button
          type="button"
          onClick={scrollToCollection}
          className="mt-8 inline-flex min-w-[220px] items-center justify-center gap-2 bg-accent px-9 py-4 text-xs font-bold uppercase tracking-[0.18em] text-foreground shadow-lg transition hover:bg-white"
        >
          {heroSlides[active].cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleSlide(active - 1)}
        className="absolute left-5 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 group-hover:opacity-100 sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>
      <button
        type="button"
        onClick={() => handleSlide(active + 1)}
        className="absolute right-5 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 group-hover:opacity-100 sm:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => handleSlide(index)}
            className={`h-1.5 rounded-full transition-all ${index === active ? "w-8 bg-accent" : "w-4 bg-white/55 hover:bg-white/85"}`}
            aria-label={`Go to ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
};

export default SplitBanner;
