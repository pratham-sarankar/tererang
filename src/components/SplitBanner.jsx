import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { heroSlides } from "./storefrontData.js";

export default function SplitBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => setActive(previous => (previous + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, active]);
  const goTo = index => setActive((index + heroSlides.length) % heroSlides.length);
  const slide = heroSlides[active];
  return <section className="home-hero" aria-label="Tererang collections" aria-roledescription="carousel"
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    onTouchStart={event => { touchStartX.current = event.touches[0].clientX; }}
    onTouchEnd={event => { if (touchStartX.current !== null) { const delta = touchStartX.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 40) goTo(active + (delta > 0 ? 1 : -1)); } touchStartX.current = null; }}>
    {heroSlides.map((item, index) => <div key={item.title} className={`home-hero-image ${index === active ? "is-active" : ""}`} aria-hidden="true"><img src={item.img} alt="" fetchPriority={index === 0 ? "high" : "auto"} /></div>)}
    <div className="home-hero-shade" />
    <div className="home-hero-copy"><p className="home-eyebrow">{slide.tag}</p><h1>{slide.title.split(" ")[0]}<br /><em>{slide.title.split(" ").slice(1).join(" ")}</em></h1><p className="home-hero-description">{slide.desc}</p><Link className="home-button" to="/shop">{slide.cta}</Link></div>
    <button className="home-hero-arrow home-hero-prev" onClick={() => goTo(active - 1)} aria-label="Previous slide"><ChevronLeft /></button>
    <button className="home-hero-arrow home-hero-next" onClick={() => goTo(active + 1)} aria-label="Next slide"><ChevronRight /></button>
    <div className="home-hero-dots">{heroSlides.map((item, index) => <button key={item.title} onClick={() => goTo(index)} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? "true" : undefined} className={index === active ? "is-active" : ""} />)}</div>
  </section>;
}
