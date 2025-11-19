// src/pages/ShararaSuits.jsx
import React from "react";

// Dummy data for Sharara Suits
const shararaData = [
  {
    id: 1,
    title: "Royal Blue Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹5,999",
    newPrice: "₹4,299",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 2,
    title: "Classic Black Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹6,499",
    newPrice: "₹4,799",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 3,
    title: "Golden Embroidered Sharara",
    brand: "Tererang",
    oldPrice: "₹7,499",
    newPrice: "₹5,499",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 4,
    title: "Peach Designer Sharara",
    brand: "Tererang",
    oldPrice: "₹8,499",
    newPrice: "₹6,199",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 5,
    title: "Red Wedding Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹9,499",
    newPrice: "₹6,999",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 6,
    title: "Green Georgette Sharara",
    brand: "Tererang",
    oldPrice: "₹6,999",
    newPrice: "₹5,299",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 7,
    title: "Yellow Silk Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹8,999",
    newPrice: "₹7,199",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 8,
    title: "Purple Heavy Sharara",
    brand: "Tererang",
    oldPrice: "₹9,999",
    newPrice: "₹7,499",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 9,
    title: "White Bridal Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹10,499",
    newPrice: "₹8,299",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 10,
    title: "Pink Stylish Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹7,499",
    newPrice: "₹5,599",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 11,
    title: "Pink Stylish Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹7,499",
    newPrice: "₹5,599",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },
  {
    id: 12,
    title: "Pink Stylish Sharara Suit",
    brand: "Tererang",
    oldPrice: "₹7,499",
    newPrice: "₹5,599",
    image: "https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS584_2_700x.jpg?v=1755064787",
  },

];

const ShararaSuits = () => {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 min-h-screen py-12 px-8">
      {/* Page Title */}
      <h1 className="text-center text-5xl font-extrabold text-pink-700 mb-14 tracking-wide drop-shadow-lg">
        ✨ Sharara Suit Collection ✨
      </h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {shararaData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-2 w-full"
          >
            {/* Image + Badge */}
            <div className="relative">
              <span className="absolute top-3 left-3 bg-pink-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-md">
                Hot
              </span>
              <img
                src={item.image}
                alt={item.title}
                className="rounded-t-2xl w-full h-[400px] object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500">{item.brand}</p>

              <div className="mt-2">
                <span className="line-through text-gray-400 mr-2">
                  {item.oldPrice}
                </span>
                <span className="text-2xl text-pink-600 font-bold">
                  {item.newPrice}
                </span>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button className="w-full border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white font-medium py-2 rounded-lg transition duration-200">
                  Choose Options
                </button>
                {/* <button className="w-full bg-pink-600 text-white hover:bg-pink-700 font-medium py-2 rounded-lg transition duration-200"> */}
              
                {/* </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShararaSuits;
