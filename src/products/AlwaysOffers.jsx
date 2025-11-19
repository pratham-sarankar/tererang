import React from 'react';

// Define the custom primary accent color (Vibrant Magenta: #E91E63)
const ACCENT_COLOR_CLASS = 'text-[#E91E63]';
const ACCENT_BG_CLASS = 'bg-[#E91E63]';
const ACCENT_BORDER_CLASS = 'border-[#E91E63]'; 

// Secondary Highlight Color (Gold for Premium/Deals)
const HIGHLIGHT_COLOR_CLASS = 'text-yellow-600';
const HIGHLIGHT_BG_CLASS = 'bg-yellow-50';

// --- Reusable Components ---

const Footer = () => (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 pt-16 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            {/* Brand Info */}
            <div>
                <h2 className="text-4xl font-extrabold text-pink-500 mb-4 tracking-wide">Tererang</h2>
                <p className="italic text-lg mb-3 text-pink-200">“Elegance Woven with Love”</p>
                <p className="text-sm leading-relaxed text-gray-400">
                    Born from passion and creativity, Tererang reimagines Indian wear with elegance and intention.
                    Every piece is crafted with love, bringing beauty that feels personal and rooted.
                </p>
                <div className="flex space-x-4 mt-5">
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition"><i className="fab fa-facebook-f"></i></a>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition"><i className="fab fa-youtube"></i></a>
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">Quick Links</h3>
                <ul className="space-y-3 text-gray-400">
                    <li><a href="/products/Kurti" className="hover:text-pink-400 transition">Products</a></li>
                    <li><a href="/Shipping" className="hover:text-pink-400 transition">Shipping Policy</a></li>
                    <li><a href="/terms" className="hover:text-pink-400 transition">Terms & Conditions</a></li>
                    <li><a href="/returns" className="hover:text-pink-400 transition">Return & Exchange</a></li>
                </ul>
            </div>

            {/* Customer Care */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">Customer Care</h3>
                <ul className="space-y-3 text-gray-400">
                    <li><a href="/orders" className="hover:text-pink-400 transition">My Orders</a></li>
                    <li><a href="/OrderTracker" className="hover:text-pink-400 transition">Track Order</a></li>
                    <li><a href="/FaqPage" className="hover:text-pink-400 transition">FAQ</a></li>
                    <li><a href="/HelpCenterPage" className="hover:text-pink-400 transition">Help Center</a></li>
                </ul>
            </div>

            {/* Contact Info */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">Contact Us</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                    <li>📍 D-268, Noida, India</li>
                    <li>📞 +91 8126742827</li>
                    <li>✉️ support@tererang.com</li>
                    <li>🕒 Mon - Sat: 9:00 AM - 8:00 PM</li>
                </ul>
            </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-700"></div>

        {/* Bottom Bar - Centered */}
        <div className="mt-6 text-center text-sm text-gray-500">
            © 2025 <span className="text-pink-400 font-semibold">Tererang</span>. All rights reserved.
            <br />
            <span className="text-gray-400">Made with ❤️ in India</span>
        </div>
    </footer>
);

// Component for a single Offer Card
const OfferCard = ({ title, description, code, condition, icon }) => (
    <div className={`bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border-t-8 ${ACCENT_BORDER_CLASS} flex flex-col items-center text-center h-full`}>
        <div className={`p-4 rounded-full ${HIGHLIGHT_BG_CLASS} mb-4`}>
            <i className={`${icon} text-3xl ${HIGHLIGHT_COLOR_CLASS}`}></i>
        </div>
        <h3 className={`text-2xl font-extrabold ${ACCENT_COLOR_CLASS} mb-2`}>{title}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        
        {code && (
            <div className="w-full mt-auto">
                <p className="text-sm font-semibold text-gray-700 mb-1">Use Code:</p>
                <div className="bg-gray-200 border-2 border-dashed border-gray-400 p-2 rounded-lg font-mono text-lg font-bold text-gray-900 tracking-wider select-all">
                    {code}
                </div>
            </div>
        )}

        <p className="text-xs text-gray-500 mt-3 italic">{condition}</p>
    </div>
);


// --- Main Application Component ---
const App = () => {
    return (
        // Include the Font Awesome CDN link
        <>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js" defer></script>
            <div className="font-sans bg-gray-50 min-h-screen text-gray-800">

                {/* Header Section - Centered, Vibrant Magenta */}
                <header className={`${ACCENT_BG_CLASS} text-white py-12 mb-12 shadow-xl`}>
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl font-extrabold tracking-wide mb-2">
                            <span className="text-white">Tererang Deals & Rewards</span>
                        </h1>
                        <p className="text-xl font-light opacity-80">
                            Elegance always comes with a reward. Explore our ongoing offers!
                        </p>
                    </div>
                </header>

                {/* Main Content Area: Offers */}
                <main>
                    <div className="max-w-7xl mx-auto px-6 pb-16 text-center">
                        
                        {/* Featured Callout - VIP Style */}
                        <div className={`bg-white p-10 rounded-xl mb-16 shadow-2xl border-b-8 ${ACCENT_BORDER_CLASS} relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-4 transform rotate-12 text-2xl font-extrabold text-white bg-pink-500 rounded-bl-xl shadow-lg">
                                VIP
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                New Customer Welcome Offer
                            </h2>
                            <p className={`text-5xl font-extrabold ${ACCENT_COLOR_CLASS} mb-4`}>
                                Flat 10% OFF
                            </p>
                            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                Start your journey with Tererang. Enjoy an exclusive discount on your very first purchase.
                            </p>
                            {/* SHOP NOW LINK CHANGE: /signup to / */}
                            <a href="/" className={`mt-5 inline-block ${ACCENT_BG_CLASS} text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-700 transition duration-300 transform hover:scale-105`}>
                                Shop Now & Claim Your Discount
                            </a>
                        </div>
                        
                        {/* Section 1: Always-On Discounts */}
                        <h2 className={`text-4xl font-extrabold text-gray-900 mb-10 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 inline-block`}>
                            Year-Round Discounts
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <OfferCard
                                icon="fas fa-truck"
                                title="Free Shipping"
                                description="Enjoy complimentary standard shipping on all orders above a minimum purchase value. Shop more, save more on delivery!"
                                condition="Minimum cart value of ₹4999 applies."
                            />

                            <OfferCard
                                icon="fas fa-box-open"
                                title="Bundle & Save 15%"
                                description="Mix and match any two Kurtis or Salwar Suits and automatically receive 15% off the total bundle price at checkout."
                                code="TERABUNDLE"
                                condition="Applies to select collections only."
                            />
                            
                            <OfferCard
                                icon="fas fa-gift"
                                title="Loyalty Reward"
                                description="Get a special gift voucher worth ₹500 on your 5th confirmed purchase with Tererang."
                                condition="Automatic credit after 5th order delivery."
                            />

                        </div>

                        {/* Section 2: Special Offers & Rewards */}
                        <h2 className={`text-4xl font-extrabold text-gray-900 mt-20 mb-10 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 inline-block`}>
                            Exclusive Rewards
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            <OfferCard
                                icon="fas fa-birthday-cake"
                                title="Birthday Special"
                                description="Celebrate your special day with a flat 20% discount code, valid for one month before or after your birthday."
                                code="HBD20"
                                condition="Must be registered on our site for 6+ months with verified date of birth."
                            />

                            <OfferCard
                                icon="fas fa-hand-holding-heart"
                                title="Refer & Earn"
                                description="Refer a friend! They get 10% off their first order, and you receive a ₹250 credit when they complete their purchase."
                                condition="Credit applied after friend's first order is successfully delivered."
                            />

                        </div>
                        
                        {/* Terms & Conditions CTA */}
                        <div className={`mt-16 bg-pink-100 p-8 rounded-xl shadow-lg border-l-4 ${ACCENT_BORDER_CLASS}`}>
                            <p className="text-xl font-bold text-gray-800 mb-3">
                                Terms Apply to All Offers
                            </p>
                            <p className="text-gray-600 mb-4">
                                All promotional codes and offers are subject to specific conditions, availability, and Tererang’s right to withdraw or modify the promotion at any time.
                            </p>
                            {/* TERMS LINK CONFIRMED: Already points to /terms */}
                            <a href="/TermsPage" className={`text-sm font-semibold ${ACCENT_COLOR_CLASS} hover:underline`}>
                                Read Full Terms & Conditions Page <i className="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                        
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default App;
