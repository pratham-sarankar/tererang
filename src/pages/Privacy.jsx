import React from 'react';
import { Footer } from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-6">
        {/* Header */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-pink-700 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: November 20, 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-pink-600">
            <p className="text-gray-700 leading-relaxed">
              At <span className="font-semibold text-pink-700">Tererang</span>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>

          {/* Information We Collect */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-database text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-pink-700 mb-2">Personal Information</h3>
                <p className="leading-relaxed">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Name and contact information (phone number, email address)</li>
                  <li>Shipping and billing address</li>
                  <li>Payment information (processed securely through UPI)</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-pink-700 mb-2">Automatically Collected Information</h3>
                <p className="leading-relaxed">
                  When you visit our website, we may automatically collect:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Browser type and version</li>
                  <li>Device information and IP address</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website addresses</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-cogs text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">How We Use Your Information</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed mb-3">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Processing and fulfilling your orders</li>
                <li>Sending order confirmations and shipping updates</li>
                <li>Responding to your inquiries and customer service requests</li>
                <li>Improving our website and services</li>
                <li>Sending promotional emails (with your consent)</li>
                <li>Detecting and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-share-alt text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Information Sharing and Disclosure</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed mb-3">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><span className="font-semibold">Service Providers:</span> Third-party companies that help us operate our business (e.g., shipping partners, payment processors)</li>
                <li><span className="font-semibold">Legal Requirements:</span> When required by law or to protect our rights</li>
                <li><span className="font-semibold">Business Transfers:</span> In connection with a merger, sale, or acquisition</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-shield-alt text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Data Security</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-user-shield text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Your Rights</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where we rely on it</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                To exercise these rights, please contact us at <a href="mailto:tererangofficial@gmail.com" className="text-pink-600 hover:text-pink-700 font-semibold">tererangofficial@gmail.com</a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-cookie-bite text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Cookies and Tracking</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. You can control cookies through your browser settings, but disabling them may affect your ability to use certain features of our website.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-sync-alt text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Changes to This Privacy Policy</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-2xl shadow-lg p-8 mb-6 border-2 border-pink-300">
            <div className="flex items-center mb-4">
              <i className="fas fa-envelope text-3xl text-pink-600 mr-4"></i>
              <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
            </div>
            <div className="text-gray-700">
              <p className="leading-relaxed mb-3">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p className="flex items-center">
                  <i className="fas fa-map-marker-alt text-pink-600 mr-3"></i>
                  <span>Moradabad, Uttar Pradesh, India</span>
                </p>
                <p className="flex items-center">
                  <i className="fas fa-phone text-pink-600 mr-3"></i>
                  <span>+91 9548971147</span>
                </p>
                <p className="flex items-center">
                  <i className="fas fa-envelope text-pink-600 mr-3"></i>
                  <a href="mailto:tererangofficial@gmail.com" className="text-pink-600 hover:text-pink-700 font-semibold">tererangofficial@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <div className="bg-pink-600 text-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-lg leading-relaxed">
              By using our website and services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
