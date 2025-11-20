import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Footer } from "../components/Footer";
import { apiUrl } from "../config/env";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Message sent successfully!'
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                <p>Moradabad, Uttar Pradesh, India</p>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-2xl" />
                <p>+91 9548971147</p>
              </div>
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-2xl" />
                <p>tererang.official@gmail.com</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-semibold text-xl mb-4">Follow us:</h3>
              <div className="flex flex-row gap-3 text-lg">
                <a href="https://www.instagram.com/tererang.official/" target="_blank" className="flex items-center gap-2 hover:text-pink-200 transition-all">
                  <FaInstagram className="text-xl" />
                  Instagram
                </a>
                <a href="https://api.whatsapp.com/send?phone=919548971147" target="_blank" className="flex items-center gap-2 hover:text-pink-200 transition-all">
                  <FaWhatsapp className="text-xl" />
                  Whatsapp
                </a>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Send us a Message
            </h2>

            {submitStatus.message && (
              <div className={`mb-4 p-4 rounded-lg ${submitStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                {submitStatus.message}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-[1.02] disabled:bg-pink-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Message ✉️'}
              </button>
            </form>
          </div>
        </div>

      </div>
      <Footer></Footer>
    </>
  );
};

export default Contact;
