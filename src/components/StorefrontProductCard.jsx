import { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import ProductImage from "./ProductImage.jsx";
import { useCart } from "../context/cartContextStore.js";

const SWATCH_PAIRS = [
  ["pink", "black"],
  ["cream", "pink"],
  ["black", "blue"],
  ["blue", "cream"],
];

const StorefrontProductCard = ({
  product,
  onSelect = () => {},
  badge = "Bestseller",
  variant,
  index = 0,
  dataDelay,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    try {
      if (addToCart && (product.backendId || product.id) && !product.id?.startsWith?.("ref-")) {
        await addToCart({
          productId: product.backendId || product.id,
          quantity: 1,
          size: product.sizes?.[0] || "M",
        });
        setQuickAdded(true);
        setTimeout(() => setQuickAdded(false), 1400);
      } else {
        setQuickAdded(true);
        setTimeout(() => setQuickAdded(false), 1400);
      }
    } catch {
      onSelect(product);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  if (variant === "home") {
    const swatches = product.swatches || SWATCH_PAIRS[index % SWATCH_PAIRS.length];
    const displayBadge = product.discount > 0 ? `-${product.discount}%` : (product.badge || badge);
    const categoryMeta = product.meta || (typeof product.raw?.category === "string"
      ? product.raw.category.replace(/([a-z])([A-Z])/g, "$1 $2")
      : (product.category || product.brand || "Signature"));

    return (
      <article
        className="product reveal"
        data-delay={dataDelay !== undefined ? dataDelay : (index % 4 || undefined)}
        onClick={() => onSelect(product)}
      >
        <div className="product-media">
          <ProductImage src={product.image} alt={product.title} loading="lazy" />
          <span className="product-tag">{displayBadge}</span>
          <button
            className={`wish ${isWishlisted ? "active" : ""}`}
            type="button"
            aria-label={`Add ${product.title} to wishlist`}
            aria-pressed={isWishlisted}
            onClick={handleWishlist}
          >
            <svg fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20.8 4.9a5.2 5.2 0 0 0-7.4 0L12 6.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
            </svg>
          </button>
          <button className="quick" type="button" onClick={handleQuickAdd}>
            {quickAdded ? "Added ✓" : "Quick add"}
          </button>
        </div>
        <div className="product-info">
          <div className="product-title-row">
            <div>
              <h3>{product.title}</h3>
              <div className="meta">{categoryMeta}</div>
            </div>
            <div className="price">
              {product.displayPrice}
              {product.displayOldPrice ? <span className="old">{product.displayOldPrice}</span> : null}
            </div>
          </div>
          <div className="swatches">
            {swatches.map((color, i) => (
              <i key={i} className={`swatch ${color}`} />
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-border bg-card">
      <button
        type="button"
        className="relative block aspect-[3/4] w-full overflow-hidden bg-secondary text-left"
        onClick={() => onSelect(product)}
        aria-label={`View ${product.title}`}
      >
        <ProductImage
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 border border-white/50 bg-card/90 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-foreground backdrop-blur-sm">
          {product.discount > 0 ? `${product.discount}% off` : badge}
        </span>
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-card/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
          <Eye className="h-4 w-4" />
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground">
          {product.brand || "tererang"}
        </p>
        <h3 className="mt-2 line-clamp-1 font-serif text-xl lowercase leading-tight text-foreground transition group-hover:text-primary">
          {product.title}
        </h3>
        {product.description ? (
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : (
          <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
            Custom-finished in the Tererang atelier.
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-baseline gap-2">
            {product.displayPrice ? <span className="text-lg font-semibold text-foreground">{product.displayPrice}</span> : null}
            {product.displayOldPrice ? <span className="text-xs text-muted-foreground line-through">{product.displayOldPrice}</span> : null}
          </div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 border border-primary px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(product);
            }}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            view details
          </button>
        </div>
      </div>
    </article>
  );
};

export default StorefrontProductCard;
