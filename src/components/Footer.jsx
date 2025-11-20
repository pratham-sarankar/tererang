export const Footer = () => (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 pt-16 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
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

        {/* Bottom Bar */}
        <div className="mt-6 text-center text-sm text-gray-500">
            © 2025 <span className="text-pink-400 font-semibold">Tererang</span>. All rights reserved.
            <br />
            <span className="text-gray-400">Made with ❤️ in India</span>
        </div>
    </footer>
);
