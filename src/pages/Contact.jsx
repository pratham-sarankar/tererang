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
      <div className="min-h-screen bg-background py-12 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif lowercase tracking-wide text-foreground mb-3">
            get in touch
          </h1>
          <p className="text-muted-foreground text-lg">
            We'd love to hear from you — whether you have a question, feedback, or collaboration idea.
          </p>
        </div>

        {/* Contact Container */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-card shadow-sm rounded-sm overflow-hidden border border-border">
          {/* Left Section - Info */}
          <div className="bg-primary text-white flex flex-col justify-center p-10">
            <h2 className="text-3xl font-serif lowercase tracking-wide mb-6">contact information</h2>
            <p className="text-white/80 mb-8 leading-relaxed text-sm">
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
                <p>tererangofficial@gmail.com</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-medium text-xl mb-4 font-serif lowercase tracking-wide">follow us</h3>
              <div className="flex flex-row gap-3 text-lg">
                <a href="https://www.instagram.com/tererang.official/" target="_blank" className="flex items-center gap-2 hover:text-white/80 transition-all text-sm">
                  <FaInstagram className="text-xl" />
                  Instagram
                </a>
                <a href="https://api.whatsapp.com/send?phone=919548971147" target="_blank" className="flex items-center gap-2 hover:text-white/80 transition-all text-sm">
                  <FaWhatsapp className="text-xl" />
                  Whatsapp
                </a>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="p-10">
            <h2 className="text-3xl font-serif lowercase tracking-wide text-foreground mb-6">
              send us a message
            </h2>

            {submitStatus.message && (
              <div className={`mb-4 p-4 rounded-sm text-sm ${submitStatus.type === 'success'
                ? 'bg-secondary text-primary border border-border'
                : 'bg-secondary text-destructive border border-border'
                }`}>
                {submitStatus.message}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 font-medium text-foreground text-sm">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-border rounded-sm p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground text-sm">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border border-border rounded-sm p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground text-sm">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write your message..."
                  className="w-full border border-border rounded-sm p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium lowercase tracking-wide py-3 rounded-sm shadow-sm transition disabled:bg-primary/50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? 'sending...' : 'send message'}
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
