import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeCarousel({ label, children }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    const update = () => setEdges({ start: element.scrollLeft <= 4, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 4 });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach(child => observer.observe(child));
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, [children]);
  const move = direction => {
    const element = track.current;
    const step = element.firstElementChild?.getBoundingClientRect().width || element.clientWidth;
    element.scrollBy({ left: direction * (step + 24), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className="home-carousel" role="region" aria-label={label} aria-roledescription="carousel">
    <div className="home-carousel-track" ref={track} tabIndex={0} aria-label={`${label} shelf`} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    }}>{children}</div>
    <button className="home-carousel-arrow home-carousel-prev" aria-label={`Previous ${label.toLowerCase()}`} disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={21} /></button>
    <button className="home-carousel-arrow home-carousel-next" aria-label={`Next ${label.toLowerCase()}`} disabled={edges.end} onClick={() => move(1)}><ChevronRight size={21} /></button>
  </div>;
}
