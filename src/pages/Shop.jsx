import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { collections } from "../components/storefrontData.js";

export default function Shop() {
  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-secondary px-6 py-16 text-center sm:py-20">
          <p className="text-sm font-semibold tracking-[0.08em] text-accent">Tererang catalog</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-5xl lowercase leading-none sm:text-6xl">shop the atelier</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Browse Tererang by collection and step into the product pages for size, fit, and custom stitching details.
          </p>
        </header>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 py-16 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
          {collections.map((collection) => (
            <Link key={collection.to} to={collection.to} className="group overflow-hidden border border-border bg-card">
              <div className="aspect-[4/5] overflow-hidden bg-secondary">
                <img src={collection.img} alt={collection.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-accent">{collection.eyebrow}</p>
                <h2 className="mt-2 font-serif text-3xl lowercase text-foreground">{collection.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{collection.desc}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  explore
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
