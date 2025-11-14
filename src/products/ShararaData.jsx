import React, { useState } from 'react';
import { ShoppingCart, Heart, ArrowLeft, Zap, Gift, Ruler, CheckCircle, Share2 } from 'lucide-react';

// -------------------------------------------------------------------
// 1. DATA (Sharara Collection) - UPDATED WITH MULTIPLE IMAGES
// -------------------------------------------------------------------

const shararaData = [
  {
    id: 1,
    title: "Royal Blue Sharara Suit",
    description: "Elegant royal blue sharara suit with intricate mirror work, soft rayon fabric, and a matching dupatta. Perfect for evening events.",
    brand: "Tere Rang",
    oldPrice: "₹5,999",
    newPrice: "₹4,299",
    image: "https://img.faballey.com/images/Product/XKS21678A/d4.jpg", // Main image
    additionalImages: [ // Added multiple images
      "https://img.faballey.com/images/Product/XKS21678A/d1.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d2.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d3.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d5.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    heightOptions: ["Up to 5'3''", "5'4''-5'6''", "5'6'' and above"],
    highlights: [
        { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
        { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
        { icon: 'Ruler', text: 'Custom Fitting Available' }
    ]
  },
  {
    id: 2,
    title: "Emerald Green Georgette Set",
    description: "Lustrous emerald green sharara set made from lightweight georgette with delicate thread embroidery. Comes with a full-length sleeve kurta.",
    brand: "Tere Rang",
    oldPrice: "₹7,499",
    newPrice: "₹5,850",
    image: "https://img.faballey.com/images/Product/XKS28726A/d4.jpg",
    additionalImages: [
      "https://img.faballey.com/images/Product/XKS28726A/d1.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d2.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d3.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d5.jpg",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    heightOptions: ["5'4''-5'6''", "5'6'' and above"],
    highlights: [
        { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
        { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
        { icon: 'Ruler', text: 'Custom Fitting Available' }
    ]
  },
  {
    id: 3,
    title: "Pastel Pink Chikankari Sharara",
    description: "Soft pastel pink cotton sharara featuring traditional Lucknowi Chikankari work. Ideal for casual daytime festivities.",
    brand: "Tere Rang",
    oldPrice: "₹4,500",
    newPrice: "₹3,199",
    image: "https://img.faballey.com/images/Product/XKU09308Z/d4.jpg",
    additionalImages: [
      "https://img.faballey.com/images/Product/XKU09308Z/d1.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d2.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d3.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d5.jpg",
    ],
    sizes: ["S", "M", "L"],
    heightOptions: ["Up to 5'3''", "5'4''-5'6''"],
    highlights: [
        { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
        { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
        { icon: 'Ruler', text: 'Custom Fitting Available' }
    ]
  },
];

// Icon mapping helper for highlights
const IconMap = { Zap, Gift, Ruler };


// -------------------------------------------------------------------
// 2. PRODUCT DETAIL COMPONENT (UPDATED)
// -------------------------------------------------------------------

const ProductDetail = ({ productId, switchView }) => {
  const product = shararaData.find((item) => item.id === productId);
  const [selectedSize, setSelectedSize] = useState(''); // Initial state can be empty
  const [selectedHeight, setSelectedHeight] = useState(''); // Initial state can be empty
  const [isAdded, setIsAdded] = useState(false);
  const [mainImage, setMainImage] = useState(product?.image); // State for the main image

  // Set initial selections when product loads or changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedHeight(product.heightOptions[0] || '');
      setMainImage(product.image); // Reset main image when product changes
    }
  }, [productId, product]);

  if (!product) return (
    <div className="text-center mt-20 p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-red-500">Product Not Found</h1>
      <button 
        onClick={() => switchView(null)} 
        className="mt-6 inline-flex items-center text-red-600 hover:text-red-800 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
      </button>
    </div>
  );

  const handleAddToCart = () => {
    if (!selectedSize || !selectedHeight) {
        console.error("Please select both size and height.");
        // In a real app, show a toast notification here
        return;
    }
    console.log(`Added to Cart: ${product.title}, Size: ${selectedSize}, Height: ${selectedHeight}`);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); 
  };
  
  const HighlightItem = ({ icon, text }) => {
      const IconComponent = IconMap[icon];
      if (!IconComponent) return null; // Fallback
      
      return (
          <div className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
              <IconComponent className="w-5 h-5 text-purple-600" />
              <span>{text}</span>
          </div>
      );
  };

  // Filter out the current product from "You may also like" section
  const relatedProducts = shararaData.filter(item => item.id !== product.id).slice(0, 3);


  return (
    <div className="relative min-h-screen bg-gray-50 p-4 sm:p-10 lg:py-16">
      
      {/* Back Button (Fixed Position) */}
      <button 
        onClick={() => switchView(null)} 
        className="fixed z-10 top-4 left-4 lg:top-10 lg:left-10 bg-white p-2 rounded-full shadow-lg text-purple-600 hover:bg-purple-50 transition flex items-center font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="hidden sm:inline">Back to Collection</span>
      </button>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white">
          
          {/* Image Gallery Section */}
          <div className="w-full lg:w-3/5 p-4 lg:p-8 flex flex-col items-center bg-gray-100 relative">
            {/* Discount Tag */}
            <div className="absolute top-8 left-8 bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg z-[5]">
                {( (parseInt(product.oldPrice.replace('₹', '').replace(',', '')) - parseInt(product.newPrice.replace('₹', '').replace(',', ''))) / parseInt(product.oldPrice.replace('₹', '').replace(',', '')) * 100).toFixed(0)}% OFF
            </div>
            
            {/* Main Product Image */}
            <img
              src={mainImage}
              alt={product.title}
              className="rounded-xl w-full max-w-lg h-[600px] object-cover border border-gray-200 transition duration-500 hover:shadow-xl hover:scale-[1.01] mb-6"
            />

            {/* Thumbnail Gallery */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {[product.image, ...(product.additionalImages || [])].map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`${product.title} - view ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition duration-200 
                    ${imgUrl === mainImage ? 'border-purple-600 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}
                  onClick={() => setMainImage(imgUrl)}
                />
              ))}
            </div>
          </div>

          {/* Details and Options Section */}
          <div className="w-full lg:w-2/5 p-6 sm:p-8 lg:p-10 relative">
            <span className="text-sm font-medium text-purple-500 uppercase tracking-[0.2em]">{product.brand}</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 mt-1">{product.title}</h1>
            
            {/* Price Block */}
            <div className="mb-6 border-b pb-4 flex items-baseline">
              <span className="line-through text-gray-400 mr-3 text-xl">{product.oldPrice}</span>
              <span className="text-4xl font-extrabold text-purple-600">{product.newPrice}</span>
              <button className="ml-auto p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed text-base">{product.description}</p>
            
            {/* Highlights */}
            <div className="mb-8 space-y-3 p-4 bg-purple-50 rounded-xl">
                {product.highlights.map((h, index) => (
                    <HighlightItem key={index} icon={h.icon} text={h.text} />
                ))}
            </div>


            {/* Size Selection */}
            <h3 className="font-semibold mb-3 text-gray-800 flex justify-between items-center">
                Select Size: <span className="text-purple-600 font-bold text-lg">{selectedSize || 'Select'}</span>
            </h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border-2 px-6 py-2 rounded-full font-medium transition duration-200 shadow-sm
                    ${selectedSize === size 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
                      : 'border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-600'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Height Selection */}
            <h3 className="font-semibold mb-3 text-gray-800 flex justify-between items-center">
                Height Range: <span className="text-cyan-600 font-bold text-lg">{selectedHeight || 'Select'}</span>
            </h3>
            <div className="flex flex-wrap gap-3 mb-10">
              {product.heightOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHeight(h)}
                  className={`border-2 px-4 py-2 rounded-full text-sm transition duration-200 shadow-sm
                    ${selectedHeight === h 
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md transform scale-105' 
                      : 'border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600'
                    }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Action Buttons - Sticky on mobile / prominent on desktop */}
            <div className="lg:sticky lg:bottom-0 lg:left-0 lg:mt-8 pt-4 lg:bg-white lg:shadow-[0_-5px_15px_rgba(0,0,0,0.05)] flex gap-4 w-full">
              <button 
                onClick={handleAddToCart}
                disabled={isAdded || !selectedSize || !selectedHeight}
                className="flex-1 flex items-center justify-center bg-purple-600 text-white font-extrabold text-lg py-3 rounded-xl hover:bg-purple-700 transition duration-300 transform hover:scale-[1.01] shadow-xl shadow-purple-300/60 disabled:bg-gray-400 disabled:shadow-none"
              >
                {isAdded ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2 animate-pulse" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6 mr-2" /> Add to Cart
                  </>
                )}
              </button>
              <button className="p-3 border-2 border-gray-300 rounded-xl text-gray-500 hover:bg-red-100 hover:text-red-500 transition duration-300 shadow-sm">
                <Heart className="w-6 h-6" />
              </button>
            </div>
            
            {/* Selection Error Message (simple inline) */}
            {(!selectedSize || !selectedHeight) && (
                 <p className="text-red-500 text-sm mt-3 text-center">Please select both Size and Height before adding to cart.</p>
            )}

          </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16 p-6 sm:p-8 bg-white rounded-3xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} switchView={switchView} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// 3. PRODUCT LIST COMPONENT (Home Page) - UNCHANGED
// -------------------------------------------------------------------

const ProductCard = ({ product, switchView }) => (
  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 group border border-gray-100">
    <div className="relative overflow-hidden" onClick={() => switchView(product.id)}>
        <img
            src={product.image}
            alt={product.title}
            className="w-full h-80 object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-4">
            <span className="text-white text-lg font-bold p-2 bg-purple-600/90 rounded-lg shadow-lg transform translate-y-full group-hover:translate-y-0 transition duration-300">Quick View</span>
        </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
      <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">{product.brand}</p>
      <div className="flex items-center justify-between">
        <div>
            <span className="line-through text-gray-400 text-base mr-2">{product.oldPrice}</span>
            <span className="text-2xl font-extrabold text-purple-600">{product.newPrice}</span>
        </div>
        <button 
            onClick={() => switchView(product.id)}
            className="text-white bg-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-700 transition transform hover:scale-110"
            aria-label={`Buy ${product.title}`}
        >
            <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const ProductList = ({ switchView }) => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 sm:p-10">
    <div className="text-center mb-16 pt-8">
        {/* Outer Black Border */}
        <div className="border-4 border-black inline-block p-2 rounded-xl shadow-2xl">
            {/* Inner Unique Color Block (Purple-700) */}
            <div className="bg-purple-700 p-6 rounded-lg">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">The Tere Rang Collection</h1>
                <p className="text-lg text-purple-200 mt-2">Discover the finest Sharara and Garara suits.</p>
            </div>
        </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {shararaData.map((product) => (
        <ProductCard key={product.id} product={product} switchView={switchView} />
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------------
// 4. MAIN APPLICATION COMPONENT (Router Replacement) - UNCHANGED
// -------------------------------------------------------------------

export default function App() {
  // state to manage the current view: null for list, product ID for detail view
  const [currentProductId, setCurrentProductId] = useState(null);

  const switchView = (id) => {
    setCurrentProductId(id);
  };

  return (
    <div className="font-sans antialiased">
      {currentProductId ? (
        <ProductDetail productId={currentProductId} switchView={switchView} />
      ) : (
        <ProductList switchView={switchView} />
      )}
    </div>
  );
}