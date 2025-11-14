import React from "react";

const Card = ({ image, brand, title, price, oldPrice, discount }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-105 overflow-hidden cursor-pointer border border-gray-100">
      <div className="relative w-full h-80 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-pink-100 text-xl">
          ❤️
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-md font-semibold text-gray-800">{brand}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-800">₹{price}</span>
          <span className="text-sm line-through text-gray-400">₹{oldPrice}</span>
          <span className="text-sm text-green-600 font-semibold">
            {discount}% OFF
          </span>
        </div>
        <button className="mt-3 w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Card;
