import React, { useState } from 'react';
// Lucide-React Icons for better UI/UX
import { Undo, RefreshCw, Wallet, Info, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';

// Policy Data Structure for easy management
const policySections = [
  {
    id: 1,
    icon: AlertTriangle,
    title: "Final Sales & Exchange Window (5-7 Days)",
    content: (
      <div className="text-gray-700 space-y-3">
        <p className="font-extrabold text-lg text-red-700">STRICTLY NO RETURNS. ALL SALES ARE FINAL.</p>
        <p>We only offer **Exchange** for products that are received **damaged, defective, or incorrect** (fault from the seller's side).</p>
        <p className="flex items-start">
          <CheckCircle className="w-5 h-5 text-cyan-600 mr-2 mt-1 flex-shrink-0" />
          The exchange request must be logged within **5-7 days** from the date of delivery.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    icon: RefreshCw,
    title: "Exchange Eligibility and Buyer Liability",
    content: (
      <div className="text-gray-700 space-y-3">
        <p className="font-semibold text-cyan-700">Exchange is *only* approved if the issue is a genuine manufacturing defect or error on our part (e.g., wrong item shipped).</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>**Buyer Confirmation:** It is mandatory for the customer to confirm all product specifications (size, color, measurements) *before* purchase.</li>
          <li>**No Exchange for Buyer Errors:** We will **not** exchange products if the fault is from the customer's side (e.g., choosing the wrong size, change of mind).</li>
          <li>The product must be **completely unused**, unwashed, and returned with all **original tags** and **packaging**.</li>
        </ul>
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          **Exclusions:** Items bought during a **Sale** or with a **Discount**, as well as **Accessories** (e.g., stoles, earrings), are not eligible for exchange.
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: Wallet,
    title: "Refunds and Exchange Procedure",
    content: (
      <div className="text-gray-700 space-y-3">
        <p className="font-bold text-lg text-red-700">NO REFUNDS (CASH OR STORE CREDIT) ARE PROVIDED.</p>
        <p>If your returned item passes our Quality Check (QC) and the defect is confirmed as a fault on our side, we will proceed with an exchange:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>**Exchange:** The replacement item (same product/specifications) will be dispatched within 5-7 working days after QC approval.</li>
          <li>If a suitable replacement is unavailable, we reserve the right to offer an alternative item or, in very rare cases, store credit.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 4,
    icon: Info,
    title: "How to Initiate an Exchange (Seller's Fault)",
    content: (
      <div className="text-gray-700 space-y-3">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to the **"My Orders"** section on our website.</li>
          <li>Select the order you wish to exchange and click **"Request Exchange"**.</li>
          <li>You must provide clear photographs/videos demonstrating the defect or damage.</li>
          <li>Our team will review your evidence within 24-48 hours and notify you if the exchange is approved.</li>
          <li>Please keep the packaging secure for the scheduled pickup.</li>
        </ol>
        <div className="p-3 bg-cyan-100 border border-cyan-300 rounded-lg text-cyan-700 text-sm mt-4">
          For any questions or assistance regarding a defective item, please email us at support@terarang.com or call +91-9548971147.
        </div>
      </div>
    ),
  },
];

// Accordion Item Component
const PolicyAccordionItem = ({ icon: Icon, title, content, isOpen, toggleAccordion }) => (
  <div className="border-b border-gray-200">
    <button
      className={`flex justify-between items-center w-full p-4 sm:p-5 text-left font-semibold transition duration-300 ${isOpen ? 'bg-cyan-50' : 'hover:bg-gray-50'}`}
      onClick={toggleAccordion}
      aria-expanded={isOpen}
    >
      <div className="flex items-center">
        <Icon className={`w-6 h-6 mr-4 transition duration-300 ${isOpen ? 'text-cyan-700' : 'text-gray-500'}`} />
        <span className={`${isOpen ? 'text-cyan-700' : 'text-gray-800'}`}>{title}</span>
      </div>
      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-cyan-700' : 'text-gray-500'}`} />
    </button>
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100 p-4 sm:p-5' : 'max-h-0 opacity-0'
      } bg-white`}
    >
      {content}
    </div>
  </div>
);

// Main Application Component
const App = () => {
  const [openId, setOpenId] = useState(1); // Set first section open by default to show the strict policy immediately

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-200">

        {/* Header Section - Highlighted Red/Cyan for Caution/Clarity */}
        <div className="bg-red-600 p-6 sm:p-10 text-white text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tere Rang: Exchange Policy Only
          </h1>
          <p className="mt-2 text-red-200 text-lg sm:text-xl font-light">
            **Please read carefully: All Sales Are Final.**
          </p>
        </div>

        {/* Policy Accordion Section */}
        <div className="p-4 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Policy Terms: Exchange for Seller Fault Only</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            {policySections.map((item) => (
              <PolicyAccordionItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                content={item.content}
                isOpen={openId === item.id}
                toggleAccordion={() => toggleAccordion(item.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Footer/Guarantee Section */}
        <div className="p-6 sm:p-8 bg-gray-100 text-center border-t border-gray-200">
            <p className="text-lg font-medium text-cyan-700">
                <CheckCircle className="w-5 h-5 inline mr-2" />
                We guarantee 100% Original, Quality-Checked Products.
            </p>
        </div>

      </div>
    </div>
  );
};

export default App;
