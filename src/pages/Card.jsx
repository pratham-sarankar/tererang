import React from "react";
import ProductImage from "../components/ProductImage.jsx";
import { Heart, ShoppingBag } from "lucide-react";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const parseNumeric = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const cleaned = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isNaN(cleaned) ? null : cleaned;
};

const formatCurrency = (value) => {
  const numeric = parseNumeric(value);
  if (numeric === null) return value ?? null;
  return priceFormatter.format(numeric);
};

const Card = ({
  image,
  brand,
  title,
  description,
  price,
  oldPrice,
  discount,
  onAddToCart,
}) => {
  const displayPrice = formatCurrency(price);
  const displayOldPrice = formatCurrency(oldPrice);
  const derivedDiscount = (() => {
    if (discount !== undefined && discount !== null) return discount;
    const numericPrice = parseNumeric(price);
    const numericOldPrice = parseNumeric(oldPrice);
    if (
      numericPrice === null ||
      numericOldPrice === null ||
      numericOldPrice <= numericPrice
    ) {
      return null;
    }
    return Math.round(((numericOldPrice - numericPrice) / numericOldPrice) * 100);
  })();

  const showOldPrice = Boolean(displayOldPrice && displayPrice && displayOldPrice !== displayPrice);
  const showDiscount = Number.isFinite(derivedDiscount) && derivedDiscount > 0;

  return (
    <div className="group bg-card rounded-md overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary">
          <ProductImage
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {showDiscount && (
            <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-xs text-foreground text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 border border-border">
              {derivedDiscount}% off
            </span>
          )}
          <button
            className="absolute top-3 right-3 bg-card/90 backdrop-blur-xs text-muted-foreground hover:text-accent p-2 rounded-full border border-border shadow-xs transition-colors duration-200"
            aria-label="Save to wishlist"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
            {brand || "tererang"}
          </span>
          <h3 className="font-serif text-base sm:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors lowercase">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        <div className="flex items-baseline gap-2 mb-3">
          {displayPrice && (
            <span className="text-base sm:text-lg font-medium text-foreground">{displayPrice}</span>
          )}
          {showOldPrice && (
            <span className="text-xs line-through text-muted-foreground">{displayOldPrice}</span>
          )}
        </div>

        <button
          className="w-full border border-primary text-foreground hover:bg-primary hover:text-white py-2.5 px-4 text-xs lowercase tracking-wider font-medium transition-colors duration-300 flex items-center justify-center gap-2"
          onClick={onAddToCart}
          type="button"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>add to bag</span>
        </button>
      </div>
    </div>
  );
};

export default Card;
