import React, { useState, useEffect } from 'react';

// Define the custom primary accent color (Vibrant Magenta: #E91E63)
const ACCENT_COLOR_CLASS = 'text-[#E91E63]';
const ACCENT_BG_CLASS = 'bg-[#E91E63]';
const ACCENT_BORDER_CLASS = 'border-[#E91E63]'; 

// --- MOCK DATA SIMULATION (Backend/MongoDB Data) ---
const mockOrdersData = [
    {
        orderId: 'TERA-20250915-001',
        date: 'Sep 15, 2025',
        total: 5499,
        status: 'Delivered',
        items: [
            { name: 'Rosewood Designer Kurti', qty: 1, price: 2999, size: 'M' },
            { name: 'Silk Dupatta - Cream', qty: 1, price: 2500, size: 'N/A' },
        ],
        shippingAddress: 'D-268, Noida, Uttar Pradesh, 201301',
    },
    {
        orderId: 'TERA-20251001-002',
        date: 'Oct 01, 2025',
        total: 7800,
        status: 'Shipped',
        items: [
            { name: 'Emerald Green Salwar Suit', qty: 1, price: 7800, size: 'L' },
        ],
        shippingAddress: 'D-268, Noida, Uttar Pradesh, 201301',
    },
    {
        orderId: 'TERA-20251010-003',
        date: 'Oct 10, 2025',
        total: 3500,
        status: 'Processing',
        items: [
            { name: 'Casual Cotton Tunic', qty: 1, price: 3500, size: 'S' },
        ],
        shippingAddress: 'D-268, Noida, Uttar Pradesh, 201301',
    },
];

// --- Utility Components ---

// Component for a single Order Card
const OrderCard = ({ order }) => {
    // Determine status badge style
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-400';
            case 'Shipped': return 'bg-yellow-100 text-yellow-700 border-yellow-400';
            case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-400';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-400';
            default: return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-gray-200 hover:border-pink-500">
            {/* Header: Order ID and Date */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">Order Placed On:</p>
                    <p className="text-lg font-semibold text-gray-800">{order.date}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Order ID:</p>
                    <p className={`text-xl font-extrabold ${ACCENT_COLOR_CLASS}`}>{order.orderId}</p>
                </div>
            </div>

            {/* Body: Items and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
                {/* 1. Item Summary (Left) */}
                <div className="md:col-span-2 text-left">
                    <p className="text-sm font-semibold text-gray-600 mb-2 border-b border-dashed pb-1">Items Summary:</p>
                    {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-medium mr-2">{item.qty}x</span> 
                            {item.name} <span className="text-xs text-gray-500">({item.size})</span>
                        </p>
                    ))}
                </div>

                {/* 2. Status Badge (Right) */}
                <div className="md:col-span-1 text-center md:text-right">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Status:</p>
                    <span 
                        className={`inline-block py-1 px-3 rounded-full text-sm font-bold border ${getStatusStyle(order.status)}`}
                    >
                        {order.status}
                    </span>
                    <button 
                        className={`mt-3 w-full md:w-auto ${ACCENT_COLOR_CLASS} text-sm font-semibold hover:underline transition`}
                        onClick={() => alert('Tracking feature not fully implemented in this demo.')}
                    >
                        Track Order <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>

            {/* Footer: Total and Address */}
            <div className="flex justify-between items-center border-t pt-4 mt-4">
                <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">Shipped To:</p>
                    <p className="text-sm font-medium text-gray-700">{order.shippingAddress.split(',')[0]}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Order Total:</p>
                    <p className="text-2xl font-extrabold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
    );
};

// Footer Component (Reused for consistency)
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


// --- Main Application Component ---
const App = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // In a real MERN app, userId would come from an Auth Context or JWT token
    const userId = "tererang-user-123"; 

    // Simulation of fetching data from the MERN Backend API
    useEffect(() => {
        const fetchOrders = () => {
            // Simulate a network delay (e.g., 1.5 seconds)
            setTimeout(() => {
                // In a real app: const response = await fetch(`/api/orders/${userId}`);
                // const data = await response.json();
                
                setOrders(mockOrdersData); // Using mock data
                setIsLoading(false);
            }, 1500);
        };

        fetchOrders();
    }, []);

    // Loader component for aesthetic loading state
    const Loader = () => (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-lg mt-8">
            <svg className={`animate-spin h-8 w-8 ${ACCENT_COLOR_CLASS}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600 font-semibold">Fetching your elegant orders...</p>
        </div>
    );

    return (
        // Include the Font Awesome CDN link
        <>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js" defer></script>
            <div className="font-sans bg-gray-50 min-h-screen text-gray-800">

                {/* Header Section - Centered, Vibrant Magenta */}
                <header className={`${ACCENT_BG_CLASS} text-white py-12 mb-12 shadow-xl`}>
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl font-extrabold tracking-wide mb-2">
                            My Orders
                        </h1>
                        <p className="text-xl font-light opacity-80">
                            View the elegance you’ve woven into your wardrobe.
                        </p>
                    </div>
                </header>

                {/* Main Content Area: Orders List */}
                <main>
                    <div className="max-w-4xl mx-auto px-6 pb-16">
                        
                        {/* User Information Mock */}
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-pink-300 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                <i className={`fas fa-user-circle mr-3 ${ACCENT_COLOR_CLASS}`}></i>
                                Welcome Back, Customer!
                            </h2>
                            <p className="text-sm text-gray-500">User ID: {userId}</p>
                        </div>

                        {isLoading ? (
                            <Loader />
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 text-center">
                                    Total Orders Placed: {orders.length}
                                </h3>
                                
                                {orders.length === 0 ? (
                                    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                                        <i className={`fas fa-box-open text-6xl ${ACCENT_COLOR_CLASS} opacity-50 mb-4`}></i>
                                        <p className="text-xl font-semibold text-gray-700">No orders found.</p>
                                        <p className="text-gray-500 mt-2">Start shopping now to see your orders here!</p>
                                        <a href="/" className={`mt-5 inline-block ${ACCENT_BG_CLASS} text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-700 transition duration-300 transform hover:scale-105`}>
                                            Go to Home Page
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <OrderCard key={order.orderId} order={order} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default App;
