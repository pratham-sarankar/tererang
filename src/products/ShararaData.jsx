/* eslint-disable no-irregular-whitespace */

import React, { useState } from 'react';
import { ShoppingCart, Heart, ArrowLeft, Zap, Gift, Ruler, CheckCircle, Share2 } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';


// Icon mapping helper for highlights
const IconMap = { Zap, Gift, Ruler };


// -------------------------------------------------------------------
// 2. PRODUCT DETAIL COMPONENT (UPDATED)
// -------------------------------------------------------------------

const ProductDetail = ({ productId, switchView }) => {
    const product = shararaData.find((item) => item.id === productId);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedHeight, setSelectedHeight] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [mainImage, setMainImage] = useState(product?.image);

    React.useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes[0] || '');
            setSelectedHeight(product.heightOptions[0] || '');
            setMainImage(product.image);
        }
    }, [productId, product]);

    if (!product) return (
        <div className="text-center mt-20 p-8 bg-background min-h-screen">
            <h1 className="text-3xl font-serif lowercase text-destructive">product not found</h1>
            <button
                onClick={() => switchView(null)}
                className="mt-6 inline-flex items-center text-primary hover:text-primary/80 transition text-sm lowercase tracking-wide font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-2" /> back to products
            </button>
        </div>
    );

    const handleAddToCart = () => {
        if (!selectedSize || !selectedHeight) {
            console.error("Please select both size and height.");
            return;
        }
        console.log(`Added to Cart: ${product.title}, Size: ${selectedSize}, Height: ${selectedHeight}`);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const HighlightItem = ({ icon, text }) => {
        const IconComponent = IconMap[icon];
        if (!IconComponent) return null;

        return (
            <div className="flex items-center space-x-2 text-foreground text-sm font-medium">
                <IconComponent className="w-5 h-5 text-primary" />
                <span>{text}</span>
            </div>
        );
    };

    const relatedProducts = shararaData.filter(item => item.id !== product.id).slice(0, 3);


    return (
        <div className="relative min-h-screen bg-background p-4 sm:p-10 lg:py-16">

            {/* Back Button (Fixed Position) */}
            <button
                onClick={() => switchView(null)}
                className="fixed z-10 top-4 left-4 lg:top-10 lg:left-10 bg-card p-2 rounded-full shadow-sm border border-border text-foreground hover:bg-secondary transition flex items-center font-medium text-sm"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline lowercase tracking-wide">back to collection</span>
            </button>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row shadow-sm rounded-sm overflow-hidden bg-card border border-border">

                {/* Image Gallery Section */}
                <div className="w-full lg:w-3/5 p-4 lg:p-8 flex flex-col items-center bg-secondary relative">
                    {/* Discount Tag */}
                    <div className="absolute top-8 left-8 bg-accent text-white text-sm font-medium py-1 px-3 rounded-full shadow-sm z-[5] lowercase">
                        {((parseInt(product.oldPrice.replace('₹', '').replace(',', '')) - parseInt(product.newPrice.replace('₹', '').replace(',', ''))) / parseInt(product.oldPrice.replace('₹', '').replace(',', '')) * 100).toFixed(0)}% off
                    </div>

                    {/* Main Product Image */}
                    <ProductImage
                        src={mainImage}
                        alt={product.title}
                        className="rounded-sm w-full max-w-lg h-[600px] object-cover border border-border transition duration-500 mb-6"
                    />

                    {/* Thumbnail Gallery */}
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {[product.image, ...(product.additionalImages || [])].map((imgUrl, index) => (
                            <ProductImage
                                key={index}
                                src={imgUrl}
                                alt={`${product.title} - view ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-sm border cursor-pointer transition duration-200
                                    ${imgUrl === mainImage ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'}`}
                                onClick={() => setMainImage(imgUrl)}
                            />
                        ))}
                    </div>
                </div>

                {/* Details and Options Section */}
                <div className="w-full lg:w-2/5 p-6 sm:p-8 lg:p-10 relative">
                    <span className="text-sm font-medium text-primary uppercase tracking-[0.2em]">{product.brand}</span>
                    <h1 className="text-4xl font-serif lowercase text-foreground mb-2 mt-1 tracking-wide">{product.title}</h1>

                    {/* Price Block */}
                    <div className="mb-6 border-b border-border pb-4 flex items-baseline">
                        <span className="line-through text-muted-foreground mr-3 text-xl">{product.oldPrice}</span>
                        <span className="text-4xl font-serif text-primary">{product.newPrice}</span>
                        <button className="ml-auto p-2 border border-border rounded-full text-muted-foreground hover:bg-secondary hover:text-primary transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-foreground/70 mb-6 leading-relaxed text-base">{product.description}</p>

                    {/* Highlights */}
                    <div className="mb-8 space-y-3 p-4 bg-secondary rounded-sm border border-border">
                        {product.highlights.map((h, index) => (
                            <HighlightItem key={index} icon={h.icon} text={h.text} />
                        ))}
                    </div>


                    {/* Size Selection */}
                    <h3 className="font-medium mb-3 text-foreground flex justify-between items-center text-sm">
                        Select Size: <span className="text-primary font-medium text-base">{selectedSize || 'Select'}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`border px-6 py-2 rounded-full font-medium transition duration-200 text-sm
                                    ${selectedSize === size
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'border-border text-foreground hover:bg-secondary hover:border-primary/50'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Height Selection */}
                    <h3 className="font-medium mb-3 text-foreground flex justify-between items-center text-sm">
                        Height Range: <span className="text-accent font-medium text-base">{selectedHeight || 'Select'}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-10">
                        {product.heightOptions.map((h) => (
                            <button
                                key={h}
                                onClick={() => setSelectedHeight(h)}
                                className={`border px-4 py-2 rounded-full text-sm transition duration-200
                                    ${selectedHeight === h
                                        ? 'bg-accent text-white border-accent shadow-sm'
                                        : 'border-border text-foreground hover:bg-secondary hover:border-accent/50'
                                    }`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons - Sticky on mobile / prominent on desktop */}
                    <div className="lg:sticky lg:bottom-0 lg:left-0 lg:mt-8 pt-4 lg:bg-card shadow-[0_-5px_15px_rgba(0,0,0,0.03)] flex gap-4 w-full">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded || !selectedSize || !selectedHeight}
                            className="flex-1 flex items-center justify-center bg-primary text-white font-medium text-base py-3 rounded-sm hover:bg-primary/90 transition duration-300 shadow-sm disabled:bg-muted-foreground/50 disabled:shadow-none text-sm lowercase tracking-wide"
                        >
                            {isAdded ? (
                                <>
                                    <CheckCircle className="w-6 h-6 mr-2 animate-pulse" /> added to cart!
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-6 h-6 mr-2" /> add to cart
                                </>
                            )}
                        </button>
                        <button className="p-3 border border-border rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive transition duration-300 shadow-sm">
                            <Heart className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Selection Error Message (simple inline) */}
                    {(!selectedSize || !selectedHeight) && (
                        <p className="text-destructive text-sm mt-3 text-center">Please select both Size and Height before adding to cart.</p>
                    )}

                </div>
            </div>

            {/* You May Also Like Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto mt-16 p-6 sm:p-8 bg-card rounded-sm shadow-sm border border-border">
                    <h2 className="text-3xl font-serif lowercase text-foreground mb-8 text-center tracking-wide">you may also like</h2>
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
    <div className="bg-card rounded-sm shadow-sm overflow-hidden cursor-pointer border border-border group">
        <div className="relative overflow-hidden" onClick={() => switchView(product.id)}>
            <ProductImage
                src={product.image}
                alt={product.title}
                className="w-full h-80 object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-4">
                <span className="text-white text-sm font-medium p-2 bg-primary/90 rounded-sm shadow-sm lowercase tracking-wide">quick view</span>
            </div>
        </div>
        <div className="p-5">
            <h3 className="text-lg font-serif lowercase text-foreground mb-1 truncate tracking-wide">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider">{product.brand}</p>
            <div className="flex items-center justify-between">
                <div>
                    <span className="line-through text-muted-foreground text-base mr-2">{product.oldPrice}</span>
                    <span className="text-xl font-medium text-primary">{product.newPrice}</span>
                </div>
                <button
                    onClick={() => switchView(product.id)}
                    className="text-white bg-primary p-3 rounded-full shadow-sm hover:bg-primary/90 transition"
                    aria-label={`Buy ${product.title}`}
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

const ProductList = ({ switchView }) => (
    <div className="min-h-screen bg-background p-6 sm:p-10">
        <div className="text-center mb-16 pt-8">
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3 font-medium">
                new arrivals
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif lowercase tracking-wide text-foreground mb-3">
                the tere rang collection
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                discover the finest sharara and garara suits.
            </p>
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
