import React from "react";

// Dummy data for Skirts
const skirtData = Array.from({ length: 20 }).map((_, idx) => ({
  id: idx + 1,
  title: `Trendy Skirt ${idx + 1}`,
  brand: "Tererang",
  oldPrice: `₹${(1499 + idx * 100).toLocaleString("en-IN")}`,
  newPrice: `₹${(999 + idx * 80).toLocaleString("en-IN")}`,
  image: `data:image/jpeg;base64,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${idx + 1}`,
}));

const Skirt = () => {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 min-h-screen py-12 px-8">
      {/* Page Title */}
      <h1 className="text-center text-5xl font-extrabold text-pink-700 mb-14 tracking-wide drop-shadow-lg">
        ✨ Skirt Collection ✨
      </h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {skirtData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-2 w-full"
          >
            {/* Image + Badge */}
            <div className="relative">
              <span className="absolute top-3 left-3 bg-pink-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-md">
                New
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
                {/* <button className="w-full bg-pink-600 text-white hover:bg-pink-700 font-medium py-2 rounded-lg transition duration-200">
                  Buy Now
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skirt;
