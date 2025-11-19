import React, { useState } from 'react';
import { Truck, RefreshCw, Lock, Mail, Users, MessageSquare } from 'lucide-react';

// --- Contact Form Component (New) ---
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending data to a server (API call) with a delay
    setTimeout(() => {
      console.log("Form Data Sent:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' }); // Reset form

      // Clear success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-10 bg-green-50 border border-green-300 rounded-xl shadow-lg animate-pulse">
        <h2 className="text-4xl font-bold text-green-700 mb-3">✅ Message Sent! Thank You!</h2>
        <p className="text-xl text-gray-700">
          Your request has been successfully received by the Tererang support team. We aim to respond within 24 business hours.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium transition duration-200 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-inner">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-3">Send Us a Direct Message</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
        <textarea
          name="message"
          id="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Describe your issue or question here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg transition duration-300 transform active:scale-95 ${
          isSubmitting 
            ? 'bg-indigo-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-5 h-5 mr-2" />
            Submit Request
          </>
        )}
      </button>
    </form>
  );
};

// --- Help Center Content Data ---
const helpCategories = [
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: Truck,
    content: (
      <>
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Tracking Your Order</h2>
        <p className="text-gray-700 mb-6">
          Once your order has been processed and shipped (typically within 48 hours), we will send you an email containing your tracking number and a link to the carrier's website. You can follow its journey right up to your doorstep.
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Delivery Timelines</h2>
        <p className="text-gray-700 mb-6">
          As a new store, we prioritize careful **Quality Control and Secure Packaging**. Standard delivery times are usually <span className="font-semibold text-indigo-600">5-7 business days</span>. Please note that delivery to remote areas may take slightly longer.
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Missing Packages</h2>
        <p className="text-gray-700">
          If your tracking shows 'delivered' but you haven't received your package, please check with neighbors and your local post office first. If it's still missing, contact us within 3 days so we can open an investigation immediately.
        </p>
      </>
    ),
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    icon: RefreshCw,
    content: (
      <>
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Our 15-Day Guarantee</h2>
        <p className="text-gray-700 mb-6">
          We want you to love your purchase. If you are not completely satisfied, you can initiate a return or exchange within <span className="font-semibold text-indigo-600">15 days of receiving your item</span>. The product must be unused and in its original packaging.
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">How to Initiate a Return</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-6">
          {/* EMAIL ADDRESS provided as text for easy copy/paste */}
          <li>Email our support team at **manishrawatac@gmail.com** with your Order Number and the reason for the return.</li>
          <li>Our team will respond within 24 hours with return instructions and a shipping label.</li>
          <li>Once the item is received and inspected, we will process your refund immediately.</li>
        </ol>

        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Refund Processing Time</h2>
        <p className="text-gray-700">
          Refunds are usually processed within **3-5 business days** after the returned item is inspected. The time it takes for the refund to appear in your bank account may vary depending on your bank.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Payments & Security',
    icon: Lock,
    content: (
      <>
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Safe Shopping Guarantee</h2>
        <p className="text-gray-700 mb-6">
          We treat your security with the highest priority. Tererang uses **SSL (Secure Sockets Layer) Encryption** on all pages, ensuring your data is protected during transmission.
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Payment Methods</h2>
        <p className="text-gray-700 mb-6">
          We currently accept all major credit and debit cards (Visa, Mastercard, Amex), as well as PayPal. We are also working on integrating local payment methods to make your checkout even smoother.
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Privacy Policy</h2>
        <p className="text-gray-700">
          We never store your credit card details. All payment processing is handled by third-party secure gateways. Your personal information is only used to process your order and improve your shopping experience.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us / Send a Message',
    icon: MessageSquare,
    // Content is the new Contact Form
    content: <ContactForm />,
  },
  {
    id: 'general',
    title: 'General Inquiries',
    icon: Users,
    content: (
      <>
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">About Tererang</h2>
        <p className="text-gray-700 mb-6">
          Tererang is built on the philosophy of making high-quality products accessible with simple, transparent service. We are constantly expanding our product catalog based on customer feedback, so let us know what you want to see!
        </p>
        
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Account Creation</h2>
        <p className="text-gray-700 mb-6">
          You don't need an account to place an order, but creating one allows you to save addresses, view past orders, and track your current shipments more easily. It takes less than 30 seconds to sign up!
        </p>

        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Wholesale/Bulk Orders</h2>
        <p className="text-gray-700">
          If you are interested in placing a large or wholesale order, please contact us directly at <span className="font-semibold">partnerships@tererang.com</span> for special pricing and dedicated support.
        </p>
      </>
    ),
  },
];

// --- Main Component ---
const HelpCenterPage = () => {
  const [activeTab, setActiveTab] = useState(helpCategories[0].id);

  const activeCategory = helpCategories.find(cat => cat.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto pt-12 pb-20">
        
        {/* Header */}
        <header className="text-center mb-12 bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
          <h1 className="text-5xl font-extrabold text-indigo-800 mb-3">
            Tererang Help Center
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about shopping with us. We're here to help!
          </p>
        </header>

        {/* Content Layout (Grid for responsiveness) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Navigation */}
          <aside className="lg:col-span-1">
            <nav className="bg-white p-4 rounded-xl shadow-lg space-y-2 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 p-2 border-b mb-2">Support Topics</h3>
              {helpCategories.map((category) => {
                const isActive = category.id === activeTab;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center w-full p-3 rounded-lg text-left transition duration-200 
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-md transform translate-x-1' 
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                  >
                    <category.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{category.title}</span>
                  </button>
                );
              })}
              
              {/* Direct Contact Fallback in Sidebar */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <a
                  // Use the mailto link for quick access, but encourage using the form
                  href="mailto:manishrawatac@gmail.com?subject=Tererang%20Quick%20Support%20Request"
                  className="flex items-center w-full p-3 bg-indigo-100 text-indigo-600 font-semibold rounded-lg 
                             hover:bg-indigo-200 transition duration-300 border border-indigo-300"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Quick Email (If Form Fails)
                </a>
                
                {/* FALLBACK INSTRUCTION for users whose mail client doesn't open */}
                <p className="text-xs text-center text-gray-500 mt-2">
                  (यदि ईमेल बटन काम नहीं करता है, तो सीधे ईमेल करें: <span className="font-semibold text-indigo-600">manishrawatac@gmail.com</span>)
                </p>
              </div>

            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 bg-white p-8 rounded-xl shadow-lg border">
            {activeCategory ? (
              <div className="space-y-8">
                {/* Render contact form content without repeating header, as it's self-contained */}
                {activeCategory.id !== 'contact' && (
                  <header className="border-b pb-4 mb-6 border-indigo-200 flex items-center">
                    <activeCategory.icon className="w-8 h-8 mr-4 text-indigo-600" />
                    <h1 className="text-4xl font-extrabold text-gray-900">{activeCategory.title}</h1>
                  </header>
                )}
                {activeCategory.content}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xl">Select a topic from the sidebar to view detailed information.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
