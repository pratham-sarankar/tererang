import React from 'react';

// Define the custom primary accent color (Vibrant Magenta: #E91E63)
const ACCENT_COLOR_CLASS = 'text-[#E91E63]';
const ACCENT_BG_CLASS = 'bg-[#E91E63]';
// Used for borders, e.g., on Policy Boxes and main Intro card
const ACCENT_BORDER_CLASS = 'border-[#E91E63]'; 

// Highlight Color (Vibrant Teal/Cyan for attention on critical text)
const HIGHLIGHT_COLOR_CLASS = 'text-cyan-600';

// --- Reusable Components ---

const InfoCard = ({ iconClass, title, content }) => (
    // Ensured InfoCard content is centered and added hover effect
    <div className="bg-gray-100 p-6 h-full rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
        {/* Icon size increased */}
        <i className={`${iconClass} text-4xl ${ACCENT_COLOR_CLASS} mb-3`}></i>
        <h3 className={`text-xl font-semibold ${ACCENT_COLOR_CLASS} mb-2`}>{title}</h3>
        <p className="text-sm text-gray-700">{content}</p>
    </div>
);

// Updated PolicyBox: light pink background and magenta accent border, keeps internal text left-aligned
const PolicyBox = ({ iconClass, title, children }) => (
    <div className={`bg-pink-50 p-6 h-full rounded-xl shadow-lg border-l-4 ${ACCENT_BORDER_CLASS} text-left`}>
        <div className="flex items-center mb-4">
            <i className={`${iconClass} text-2xl ${ACCENT_COLOR_CLASS} mr-3`}></i>
            <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS}`}>{title}</h3>
        </div>
        {children}
    </div>
);

const Footer = () => (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 pt-16 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            {/* Brand Info */}
            <div>
                <h2 className="text-4xl font-extrabold text-black-500 mb-4 tracking-wide">Tererang</h2>
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


// --- Main Application Component ---
const App = () => {
    return (
        // Include the Font Awesome CDN link in the React environment for icons to display
        <>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js" defer></script>
            <div className="font-sans bg-gray-50 min-h-screen text-gray-800">

                {/* Header Section (Uses Vibrant Magenta Accent) - Centered */}
                <header className={`${ACCENT_BG_CLASS} text-white py-12 mb-12 shadow-lg`}>
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl font-extrabold tracking-wide mb-2">
                            <span className="text-white">Tererang</span>
                        </h1>
                        <p className="text-xl font-light opacity-80">
                            Terms & Conditions
                        </p>
                    </div>
                </header>

                {/* Main Content Area: Terms and Conditions */}
                <main>
                    <div className="max-w-6xl mx-auto px-6 pb-16">
                        
                        {/* Introduction - HIGHLY HIGHLIGHTED STYLE */}
                        <div className={`bg-white p-10 rounded-xl mb-12 shadow-2xl border-l-8 ${ACCENT_BORDER_CLASS} text-left`}>
                            
                            <div className="flex items-center mb-4 space-x-4">
                                {/* Large, prominent icon */}
                                <i className={`fas fa-scroll text-5xl ${ACCENT_COLOR_CLASS}`}></i> 
                                {/* Highlighted Welcome Text */}
                                <h2 className="text-3xl font-extrabold text-pink-700 tracking-tight">
                                    Welcome to Tererang!
                                </h2>
                            </div>

                            <p className="text-lg leading-relaxed text-gray-700 border-t pt-4 mt-4 border-gray-200">
                                We are committed to providing a transparent and satisfying shopping experience built on elegance and trust. Please review our store policies carefully before placing an order. By accessing or using our website, and by making a purchase, you agree to be bound by these terms and conditions.
                            </p>
                            <p className="text-sm mt-4 text-gray-500">
                                Last Updated: October 15, 2025
                            </p>
                        </div>

                        {/* Detailed Sections Container */}
                        <div className="space-y-12">

                            {/* 1. Product and Order Terms */}
                            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-xl">
                                {/* Enhanced H2 Heading: Dark color, larger size */}
                                <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 text-center`}>1. Product & Order Terms</h2>
                                
                                <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>Order Confirmation and Availability</h3>
                                <p className="text-gray-700 text-left">
                                    All orders are subject to product availability and the confirmation of the order price. While we strive to maintain accurate inventory, placing an item in your cart does not guarantee its availability.
                                </p>

                                <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>Product Images and Colors</h3>
                                <p className="text-gray-700 text-left">
                                    We make every effort to display the colors and details of our products accurately. However, colors may vary slightly due to individual screen settings, lighting conditions during photography, and natural variations in the fabric dyes. We cannot guarantee that your device's display of any color will accurately reflect the product's true color.
                                </p>

                                <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>Size Information (Mandatory Check)</h3>
                                <div className="bg-gray-100 p-4 rounded-xl text-left">
                                    <p className="font-bold text-gray-800 mb-3">Important Size Guidelines</p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                        <li className="text-base text-gray-900"><span className={`font-extrabold ${HIGHLIGHT_COLOR_CLASS}`}>Please always refer to our specific size chart</span> before placing your order.</li>
                                        <li>All sizes mentioned in our size charts are in **inches**.</li>
                                        <li>Accurate measurements help ensure a perfect fit and prevent sizing issues, as returns based on fit are subject to the strict policy outlined below.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            {/* 2. Payment, Cancellation, and Refund Policy */}
                            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-xl">
                                {/* Enhanced H2 Heading: Dark color, larger size */}
                                <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 text-center`}>2. Payment, Cancellation & Refunds</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Payment Policy Card (Left) */}
                                    <PolicyBox iconClass="fas fa-credit-card" title="Payment Policy">
                                        <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500 mb-4">
                                            <p className="font-bold text-red-700">
                                                <i className="fas fa-exclamation-triangle mr-2"></i> No Cash on Delivery (COD)
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            We **do not** offer Cash on Delivery (COD) services. All orders must be <span className={`font-bold ${HIGHLIGHT_COLOR_CLASS}`}>prepaid</span> through the secure payment options available at checkout, including credit/debit cards, UPI, net banking, and digital wallets.
                                        </p>
                                    </PolicyBox>
                                    
                                    {/* Cancellation Policy Card (Right) */}
                                    <PolicyBox iconClass="fas fa-redo-alt" title="Order Cancellation">
                                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 text-sm">
                                            <li className={`text-base text-gray-900`}><span className={`font-extrabold ${HIGHLIGHT_COLOR_CLASS}`}>Orders cannot be cancelled</span> once payment is confirmed.</li>
                                            <li>Please double-check your order details before making payment.</li>
                                        </ul>
                                        
                                        <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 border-t pt-3 border-gray-300`}>Refund Policy</h3>
                                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 text-sm">
                                            <li>Refunds are processed **only for approved store errors** (see Section 3).</li>
                                            <li>Refund processing time: **5-7 business days** after the item is received and inspected.</li>
                                            <li>Refunds will be credited to the **original payment method**.</li>
                                        </ul>
                                    </PolicyBox>
                                </div>
                            </div>


                            {/* 3. Return & Exchange Policy (Store Errors Only) */}
                            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-xl">
                                {/* Enhanced H2 Heading: Dark color, larger size */}
                                <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 text-center`}>3. Return & Exchange Policy</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* General Policy Card (Left) */}
                                    <PolicyBox iconClass="fas fa-shipping-fast" title="General Policy">
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            We maintain a strict quality control process. We **do not accept refunds or exchanges** unless the error is clearly from our side ("Store Errors"). Kindly double-check your order details, size, and color before confirming your purchase.
                                        </p>
                                    </PolicyBox>
                                    
                                    {/* Returns Accepted Card (Right) */}
                                    <PolicyBox iconClass="fas fa-check-circle" title="Returns Accepted Only For Store Errors">
                                        <p className="font-semibold text-gray-700 text-sm mb-2">A return will be accepted ONLY if:</p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 text-sm">
                                            <li>We sent the **wrong item, wrong size**, or a **defective product**.</li>
                                            <li className={`text-base text-gray-900`}>A <span className={`font-extrabold ${HIGHLIGHT_COLOR_CLASS}`}>full unboxing video</span> is provided as proof. The video must be **uncut and continuous** from the moment the sealed package is opened.</li>
                                            <li>The return process is initiated within **2-3 days** of receiving the order. Requests after this window will not be accepted.</li>
                                        </ul>
                                    </PolicyBox>
                                </div>
                            </div>

                            {/* 4. Additional Terms */}
                            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-xl">
                                {/* Enhanced H2 Heading: Dark color, larger size */}
                                <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 text-center`}>4. Additional Terms</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    
                                    <InfoCard
                                        iconClass="fas fa-box-open"
                                        title="Order Confirmation"
                                        content="All orders are subject to availability and confirmation of the order price."
                                    />
                                    
                                    <InfoCard
                                        iconClass="fas fa-palette"
                                        title="Product Images"
                                        content="Colors may vary slightly due to screen settings and lighting conditions."
                                    />
                                    
                                    <InfoCard
                                        iconClass="fas fa-headset"
                                        title="Customer Support"
                                        content="Contact our support team for any queries **before** placing your order."
                                    />
                                </div>
                            </div>
                            
                            {/* 5. General Legal Provisions */}
                            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-xl">
                                {/* Enhanced H2 Heading: Dark color, larger size */}
                                <h2 className={`text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 ${ACCENT_BORDER_CLASS} pb-3 text-center`}>5. General Legal Provisions</h2>
                                
                                <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>Intellectual Property</h3>
                                <p className="text-gray-700 text-left">
                                    All content on the Tererang website, including designs, text, graphics, logos, images, and software, is the property of Tererang and protected by intellectual property laws. You may not use any content without our express written permission.
                                </p>

                                <h3 className={`text-xl font-bold ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>Governing Law</h3>
                                <p className="text-gray-700 text-left">
                                    These Terms and Conditions shall be governed by and construed in accordance with the laws of **India**, with the exclusive jurisdiction of courts in **Noida, Uttar Pradesh**.
                                </p>
                            </div>

                        </div>

                        {/* Footer Contact Note - Centered and made more prominent */}
                        <div className="mt-12 text-center bg-gray-100 p-8 shadow-md rounded-xl">
                            <p className={`text-2xl font-extrabold ${ACCENT_COLOR_CLASS} mb-3`}>
                                Thank you for shopping with Tererang!
                            </p>
                            <p className="mt-3 text-gray-700">
                                We appreciate your understanding and cooperation. For any queries, feel free to contact our support team before placing your order.
                            </p>
                            <p className="text-sm mt-4 text-gray-500">
                                Last Updated: October 15, 2025
                            </p>
                        </div>
                        
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default App;
