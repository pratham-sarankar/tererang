import React from "react";

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
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-105 overflow-hidden cursor-pointer border border-gray-100">
      <div className="relative w-full h-80 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-pink-100 text-xl" aria-label="Save to wishlist">
          ❤️
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-md font-semibold text-gray-800">{brand || "Tererang"}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {displayPrice && (
            <span className="text-lg font-bold text-gray-800">{displayPrice}</span>
          )}
          {showOldPrice && (
            <span className="text-sm line-through text-gray-400">{displayOldPrice}</span>
          )}
          {showDiscount && (
            <span className="text-xs sm:text-sm text-green-600 font-semibold">
              {derivedDiscount}% OFF
            </span>
          )}
        </div>
        <button
          className="mt-3 w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition"
          onClick={onAddToCart}
          type="button"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Card;
