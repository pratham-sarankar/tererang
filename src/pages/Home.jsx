import React from "react";
import Card from "./Card";
import banner from "../components/Banner.png";

const Home = () => {
  // Common product data (you can replace later with API)
  const products = [
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
            title: "Velvet Party Wear Suit",
            description: "Luxury velvet suit with heavy Zari work, perfect for winter weddings and grand events.",
            brand: "Tere Rang",
            oldPrice: "₹12,999",
            newPrice: "₹9,850",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sV4c_2_s0OQ5OqW_7i3C-Nl8jB2k5b1yYw&s",
            additionalImages: [
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7kS9i0z6w2y0g-9dF8V7l8zT4w5-2gR6fFw&s",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lY4qYtG5e5d3g-G4r4yP3w4F8k5V9i7-Q&s",
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
            id: 4,
            title: "Yellow Mustard Cotton Kurti",
            description: "Bright yellow mustard pure cotton kurti with block print design. Perfect for everyday wear or office.",
            brand: "Tere Rang",
            oldPrice: "₹2,499",
            newPrice: "₹1,150",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3G7_W4y9_7J-W5I8H8M8L5Y8k3C_4zG6cQ&s",
            additionalImages: [
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhvH4x6zY0k8z2p3i0v0I9p7-P0G2n9v4bQ&s",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7sH8-N1n3f0z7i3J7Y9v8D1v8D9f5d3G7Yw&s",
            ],
            sizes: ["S", "M", "L", "XL"],
            heightOptions: ["5'4''-5'6''", "5'6'' and above"],
            highlights: [
                { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
                { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
                { icon: 'Ruler', text: 'Custom Fitting Available' }
            ]
          },
          // Add more products for a rich home page
          {
              id: 5,
              title: "Ivory Anarkali Gown",
              description: "Flowing ivory Anarkali gown with a gold border and lightweight net dupatta. Ideal for festivals.",
              brand: "Tere Rang",
              oldPrice: "₹8,000",
              newPrice: "₹6,500",
              image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-A7fT8Pz9x9n9P9x_7j3C-Nl8jB2k5b1yYw&s",
              additionalImages: [],
              sizes: ["M", "L", "XL"],
              heightOptions: ["5'4''-5'6''", "5'6'' and above"],
              highlights: [
                  { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
                  { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
                  { icon: 'Ruler', text: 'Custom Fitting Available' }
              ]
            },
//     {
     
//      image:
//         "https://www.libas.in/cdn/shop/files/27190.jpg?v=1756105763",
//       brand: "Libas",
//       title: "Women Kurta with Trousers & Dupatta",
//       price: 2799,
//       oldPrice: 7999,
//       discount: 65,
//     },
//     {
//       image:
//       "https://maharanidesigner.com/wp-content/uploads/2020/08/Designer-Suits-For-Girls.jpeg.webp",
//       brand: "Anouk",
//       title: "Embroidered Straight Kurta Set",
//       price: 2499,
//       oldPrice: 9999,
//       discount: 75,
//     },
//     {
//       image:
// "https://ibaadatbyjasmine.com/cdn/shop/files/WhatsAppImage2025-06-06at21.28.19_b8497859_540x.jpg?v=1749272465",
//       title: "Printed Cotton Kurta Set",
//       price: 1799,
//       oldPrice: 5999,
//       discount: 70,
//     },
//     {
//       image:
// "https://ibaadatbyjasmine.com/cdn/shop/files/WhatsAppImage2025-07-18at16.41.24_54276767_540x.jpg?v=1754128491",
//       brand: "Aaghnya",
//       title: "Women Printed Kurta Set",
//       price: 750,
//       oldPrice: 4345,
//       discount: 83,
//     },
//     { image:
//       "https://www.libas.in/cdn/shop/files/27190.jpg?v=1756105763",
//     brand: "Libas",
//     title: "Women Kurta with Trousers & Dupatta",
//     price: 2799,
//     oldPrice: 7999,
//     discount: 65,
//   },
//   {
//     image:
//     "https://maharanidesigner.com/wp-content/uploads/2020/08/Designer-Suits-For-Girls.jpeg.webp",
//     brand: "Anouk",
//     title: "Embroidered Straight Kurta Set",
//     price: 2499,
//     oldPrice: 9999,
//     discount: 75,
//   },
//   {
//     image:
// "https://ibaadatbyjasmine.com/cdn/shop/files/WhatsAppImage2025-06-06at21.28.19_b8497859_540x.jpg?v=1749272465",
//     title: "Printed Cotton Kurta Set",
//     price: 1799,
//     oldPrice: 5999,
//     discount: 70,
//   },
//   {
//     image:
// "https://ibaadatbyjasmine.com/cdn/shop/files/WhatsAppImage2025-07-18at16.41.24_54276767_540x.jpg?v=1754128491",
//     brand: "Aaghnya",
//     title: "Women Printed Kurta Set",
//     price: 750,
//     oldPrice: 4345,
//     discount: 83,
//   },
  ];

  // reusable section component
  const renderSection = (title, gradient) => (
    <section className="mb-16">
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white py-3 rounded-lg shadow-lg ${gradient}`}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((item, i) => (
          <Card
            key={i}
            image={item.image}
            brand={item.brand}
            title={item.title}
            price={item.price}
            oldPrice={item.oldPrice}
            discount={item.discount}
          />
        ))}
      </div>
    </section>
  );

  return (
    <>
      {/* Banner Section */}
      <div className="w-full h-64 sm:h-80 md:h-[420px] mt-4 overflow-hidden relative">
        <img
          src={banner}
          alt="Banner"
          className="w-full h-full object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Welcome Section */}
      <div className="text-center mt-8 mb-12 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Welcome to <span className="text-pink-500">Tererang</span>
        </h1>
        <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
          Redefining ethnic fashion with elegance and style ✨ Explore our
          exclusive collections of Kurtis, Shararas, Suits, and more.
        </p>
      </div>

      {/* Main Product Sections */}
      <div className="max-w-7xl mx-auto px-6">
        {renderSection("🛍️ Latest Collection", "bg-gradient-to-r from-pink-500 to-rose-500")}
        {renderSection("✨ Featured Products", "bg-gradient-to-r from-purple-500 to-indigo-500")}
        {renderSection("🔥 Trending Now", "bg-gradient-to-r from-orange-400 to-red-500")}
        {renderSection("🌸 New Arrivals", "bg-gradient-to-r from-teal-400 to-cyan-500")}
        {renderSection("💥 Best Offers", "bg-gradient-to-r from-green-400 to-emerald-500")}
      </div>
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
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-youtube"></i>
        </a>
      </div>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Quick Links
      </h3>
      <ul className="space-y-3 text-gray-400">
        <li><a href="/products/Kurti" className="hover:text-pink-400 transition">Products</a></li>
        <li><a href="/Shipping" className="hover:text-pink-400 transition">Shipping Policy</a></li>
        <li><a href="/TermsPage" className="hover:text-pink-400 transition">Terms & Conditions</a></li>
        <li><a href="/ReturnPolicy" className="hover:text-pink-400 transition">Return & Exchange</a></li>
      </ul>
    </div>

    {/* Customer Care */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Customer Care
      </h3>
      <ul className="space-y-3 text-gray-400">
        <li><a href="/orders" className="hover:text-pink-400 transition">My Orders</a></li>
        <li><a href="/OrderTracker" className="hover:text-pink-400 transition">Track Order</a></li>
        <li><a href="/FaqPage" className="hover:text-pink-400 transition">FAQ</a></li>
        <li><a href="/HelpCenterPage" className="hover:text-pink-400 transition">Help Center</a></li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Contact Us
      </h3>
      <ul className="space-y-3 text-gray-400 text-sm">
        <li>📍 Noida, Delhi, Muradabad , India</li>
        <li>📞 +91 9548971147</li>
        <li>✉️ support@tererang.com</li>
        {/* <li>🕒 Mon - Sat: 9:00 AM - 8:00 PM</li> */}
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

     
    </>
  );
};

export default Home;
