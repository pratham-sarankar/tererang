import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 via-white to-pink-100 py-12 px-6">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-pink-700 mb-3">
          Get in Touch 💌
        </h1>
        <p className="text-gray-600 text-lg">
          We'd love to hear from you — whether you have a question, feedback, or collaboration idea.
        </p>
      </div>

      {/* Contact Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Section - Info */}
        <div className="bg-pink-600 text-white flex flex-col justify-center p-10">
          <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
          <p className="text-pink-100 mb-8 leading-relaxed">
            Our team is here to assist you with your queries. Reach out through the details below.
          </p>

          <div className="space-y-6 text-lg">
            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-2xl" />
              <p>123 Fashion Street, Noida, Uttar Pradesh, India</p>
            </div>
            <div className="flex items-center gap-4">
              <FaPhoneAlt className="text-2xl" />
              <p>+91 9876543210</p>
            </div>
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-2xl" />
              <p>support@tererang.com</p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="font-semibold text-xl mb-2">Follow us:</h3>
            <div className="flex gap-5 text-2xl">
              <a href="#" className="hover:text-pink-200 transition-all">
                🌸 Instagram
              </a>
              <a href="#" className="hover:text-pink-200 transition-all">
                💼 LinkedIn
              </a>
              <a href="#" className="hover:text-pink-200 transition-all">
                🕊️ Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Send us a Message
          </h2>

          <form className="space-y-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Your Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Message</label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              Send Message ✉️
            </button>
          </form>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-12 text-gray-600">
        <p>© 2025 Tererang. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Contact;
