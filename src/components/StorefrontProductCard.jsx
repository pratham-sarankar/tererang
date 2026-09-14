import { Eye, ShoppingBag } from "lucide-react";
import ProductImage from "./ProductImage.jsx";

const StorefrontProductCard = ({ product, onSelect = () => {}, badge = "Bestseller", variant }) => variant === "home" ? (
  <article className="home-product-card">
    <button className="home-product-image" type="button" onClick={() => onSelect(product)} aria-label={`View ${product.title}`}>
      <ProductImage src={product.image} alt={product.title} loading="lazy" />
      <span className="home-product-badge">{product.discount > 0 ? `${product.discount}% off` : badge}</span>
    </button>
    <p className="home-product-category">{typeof product.raw?.category === "string" ? product.raw.category.replace(/([a-z])([A-Z])/g, "$1 $2") : product.brand}</p>
    <h3><button type="button" onClick={() => onSelect(product)}>{product.title}</button></h3>
    <div className="home-product-price">{product.displayPrice}{product.displayOldPrice ? <del>{product.displayOldPrice}</del> : null}</div>
  </article>
) : (
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

export default StorefrontProductCard;
