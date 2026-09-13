import React from 'react';
import ProductImage from '../components/ProductImage.jsx';
import { Footer } from '../components/Footer.jsx';
import { ShoppingBag } from 'lucide-react';

const shararaData = [
  {
    id: 1,
    title: "Royal Blue Sharara Suit",
    brand: "tererang",
    oldPrice: "₹5,999",
    newPrice: "₹4,299",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 2,
    title: "Classic Black Sharara Suit",
    brand: "tererang",
    oldPrice: "₹6,499",
    newPrice: "₹4,799",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 3,
    title: "Golden Embroidered Sharara",
    brand: "tererang",
    oldPrice: "₹7,499",
    newPrice: "₹5,499",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 4,
    title: "Peach Designer Sharara",
    brand: "tererang",
    oldPrice: "₹8,499",
    newPrice: "₹6,199",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 5,
    title: "Red Wedding Sharara Suit",
    brand: "tererang",
    oldPrice: "₹9,499",
    newPrice: "₹6,999",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 6,
    title: "Green Georgette Sharara",
    brand: "tererang",
    oldPrice: "₹6,999",
    newPrice: "₹5,299",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
];

const ShararaSuits = () => {
  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        {/* Page Header */}
        <div className="py-16 sm:py-20 text-center bg-secondary border-b border-border">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-accent uppercase tracking-[0.3em] text-xs font-medium mb-3">
              festive edit
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif lowercase text-foreground mb-4 tracking-wide">
              sharara suit collection
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              handcrafted georgette and silk shararas woven with timeless artistry.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {shararaData.map((item) => (
              <div
                key={item.id}
                className="group bg-card rounded-md overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
                      {item.brand}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors lowercase">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base sm:text-lg font-medium text-foreground">{item.newPrice}</span>
                    <span className="text-xs line-through text-muted-foreground">{item.oldPrice}</span>
                  </div>

                  <button
                    className="w-full border border-primary text-foreground hover:bg-primary hover:text-white py-2.5 px-4 text-xs lowercase tracking-wider font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                    type="button"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>view options</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShararaSuits;
