import React, { useState } from 'react';
import { ChevronDown, Lock, Truck, RefreshCw, Mail } from 'lucide-react'; // Utilizing Lucide Icons

// FAQ Data - Essential questions for your new e-commerce store
const faqData = [
  {
    question: "What is Tererang, and why should I trust it?",
    answer: "Tererang is a new, customer-centric e-commerce platform dedicated to providing you with high-quality products and a seamless shopping experience. We prioritize **security, transparency, and outstanding customer service** to ensure your purchase is worry-free."
  },
  {
    question: "How long will it take for my order to arrive?",
    answer: "As we are a new store, we place extra emphasis on **Quality Control** and secure packaging. Typically, delivery takes **5 to 7 business days** depending on your location. You will receive a tracking link after shipment so you can monitor your order's status in real-time."
  },
  {
    question: "What is your Cancellation Policy?",
    answer: "Orders can only be cancelled within 12 hours of placing the order. After this window, we begin processing your order and cannot accept cancellations. However, exchanges can be accepted with a valid video of the damaged product as proof."
  },
  {
    question: "Is my payment safe and secure on Tererang?",
    answer: "Yes, absolutely! We use the latest **SSL Encryption** and adhere to PCI-DSS compliance standards to keep your payment secure. Your credit card or bank information is never stored by us."
  },
  {
    question: "How can I contact Customer Support?",
    answer: "You can email us anytime at **tererangofficial@gmail.com**. We aim to respond to all inquiries within 24 hours. We are also planning to launch a live chat option on our website soon for immediate assistance!"
  },
];

// Accordion Item Component
const AccordionItem = ({ faq, isOpen, toggleAccordion, Icon }) => {
  return (
    <div className="border border-border bg-card rounded-sm shadow-sm mb-4 overflow-hidden">
      {/* Question Header */}
      <button
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none transition duration-300"
        onClick={toggleAccordion}
      >
        <div className="flex items-center">
          {Icon && <Icon className="w-6 h-6 mr-4 text-primary flex-shrink-0" />}
          <span className={`text-lg font-serif lowercase tracking-wide ${isOpen ? 'text-primary' : 'text-foreground'}`}>
            {faq.question}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 ml-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
        />
      </button>

      {/* Answer Content - Uses transition for smooth opening/closing */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border mt-4 mx-6">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main FAQ Page Component
const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getIcon = (index) => {
    switch (index) {
      case 0: return RefreshCw; // General Trust / Quality
      case 1: return Truck; // Shipping
      case 2: return RefreshCw; // Returns & Exchanges
      case 3: return Lock; // Security
      case 4: return Mail; // Contact
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto py-12">

        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif lowercase tracking-wide text-foreground mb-4">
            your questions, our answers
          </h1>
          <p className="text-xl text-muted-foreground">
            Frequently Asked Questions (FAQs) about Tererang.
            We know you want to trust a new store, so we've made everything clear and simple.
          </p>
        </header>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              toggleAccordion={() => toggleAccordion(index)}
              Icon={getIcon(index)}
            />
          ))}
        </div>

        {/* Call to Action (CTA) */}
        <div className="mt-12 text-center p-8 bg-secondary rounded-sm border border-border">
          <h2 className="text-2xl font-serif lowercase tracking-wide text-foreground mb-3">
            didn't find your answer?
          </h2>
          <p className="text-muted-foreground mb-4">
            Our dedicated support team is ready to assist you.
          </p>
          <a
            href="mailto:tererangofficial@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium lowercase tracking-wide rounded-sm
                       hover:bg-primary/90 transition duration-300 shadow-sm"
          >
            <Mail className="w-5 h-5 mr-2" />
            contact us
          </a>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;