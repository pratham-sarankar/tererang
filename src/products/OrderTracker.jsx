import React, { useState } from 'react';

// DUMMY API CALL (इसे अपने असली बैकएंड API से बदलें)
const mockFetchOrderStatus = async (trackingId) => {
  // असली API कॉल के लिए यहां axios या fetch का उपयोग करें:
  // const response = await fetch(`/api/track?id=${trackingId}`);
  // const data = await response.json();
  // return data;

  // नेटवर्क देरी का अनुकरण करने के लिए
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  if (trackingId === "12345") {
    return {
      success: true,
      data: {
        trackingId: '12345',
        orderNumber: 'ORD-2023-98765',
        status: 'Shipped',
        message: 'Your order is currently out for delivery and expected by EOD.',
        timeline: [
          { name: 'Order Placed', date: '2023-10-20', active: true },
          { name: 'Processed', date: '2023-10-21', active: true },
          { name: 'Shipped', date: '2023-10-22', active: true },
          { name: 'Out for Delivery', date: '2023-10-23', active: false }, // will be active if currentStep is 4
          { name: 'Delivered', date: null, active: false },
        ],
        currentStep: 3, // Shipped
        estimatedDelivery: 'October 24, 2023',
        deliveryAddress: '123 Main St, Anytown, CA 90210',
        items: [
          { name: 'Wireless Headphones', qty: 1, price: 99.99 },
          { name: 'Phone Charger', qty: 2, price: 19.99 },
        ]
      }
    };
  } else if (trackingId === "67890") {
    return {
      success: true,
      data: {
        trackingId: '67890',
        orderNumber: 'ORD-2023-11223',
        status: 'Delivered',
        message: 'Your order was successfully delivered on October 20, 2023.',
        timeline: [
          { name: 'Order Placed', date: '2023-10-17', active: true },
          { name: 'Processed', date: '2023-10-18', active: true },
          { name: 'Shipped', date: '2023-10-19', active: true },
          { name: 'Out for Delivery', date: '2023-10-20', active: true },
          { name: 'Delivered', date: '2023-10-20', active: true },
        ],
        currentStep: 5, // Delivered
        estimatedDelivery: 'Delivered',
        deliveryAddress: '456 Oak Ave, Somewhere, NY 10001',
        items: [
          { name: 'Smartwatch', qty: 1, price: 249.00 },
        ]
      }
    };
  }
  return {
    success: false,
    message: 'Tracking ID not found. Please check and try again.',
  };
};

// Loading Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="ml-3 text-indigo-700 font-medium">Fetching status...</p>
  </div>
);

const OrderTrackingPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a Tracking ID to track your order.");
      setOrderData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const result = await mockFetchOrderStatus(trackingId.trim());
      if (result.success) {
        setOrderData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred while tracking your order.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTimeline = () => {
    if (!orderData || !orderData.timeline) return null;

    const totalSteps = orderData.timeline.length;
    // Calculate the width of the active line based on currentStep
    const activeLineWidth = ((orderData.currentStep - 1) / (totalSteps - 1)) * 100;

    return (
      <div className="relative mt-8 mb-12">
        {/* Full grey line for the background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2 mx-8"></div>
        {/* Active indigo line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 transform -translate-y-1/2 mx-8 transition-all duration-700 ease-in-out" 
          style={{ width: `${activeLineWidth}%` }}
        ></div>

        <div className="flex justify-between items-start">
          {orderData.timeline.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= orderData.currentStep;
            const isCurrent = stepNumber === orderData.currentStep;

            return (
              <div 
                key={step.name} 
                className={`flex flex-col items-center w-1/5 text-center px-2 z-10 
                            ${index === 0 ? 'items-start' : (index === totalSteps - 1 ? 'items-end' : '')}`}
              >
                {/* Circle */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                              text-white text-base font-semibold transition-all duration-500 
                              ${isActive ? 'bg-indigo-600 shadow-lg' : 'bg-gray-300'}`}
                >
                  {stepNumber}
                </div>
                {/* Step Name */}
                <p className={`mt-3 text-sm font-medium transition-colors duration-500 
                              ${isActive ? 'text-indigo-800' : 'text-gray-600'}
                              ${isCurrent ? 'font-bold text-lg text-indigo-900' : ''}`}
                >
                  {step.name}
                </p>
                {step.date && 
                  <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                }
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-xl p-8 sm:p-12 border border-indigo-200">
        <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-8 sm:mb-12">
          <span className="block text-3xl font-light text-gray-600 mb-2">My Order</span>
          Track Your Delivery
        </h1>

        {/* Tracking Input Section */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
          <input
            type="text"
            placeholder="Enter your Tracking ID (e.g., 12345 or 67890)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-grow p-4 border-2 border-indigo-400 rounded-lg text-lg text-gray-800 
                       focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm
                       placeholder-gray-400"
          />
          <button
            onClick={handleTrackOrder}
            disabled={isLoading}
            className="px-8 py-4 bg-indigo-600 text-white text-xl font-bold rounded-lg 
                       hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-300 
                       transform hover:scale-105 active:scale-95 shadow-md"
          >
            {isLoading ? 'Tracking...' : 'Track Order'}
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && <Spinner />}

        {/* Error Message */}
        {error && (
          <div className="p-5 bg-red-100 text-red-700 font-medium rounded-lg mb-8 border border-red-300 text-center">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Order Details Display */}
        {orderData && (
          <div className="bg-indigo-50 p-6 sm:p-10 rounded-xl shadow-inner border border-indigo-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6 border-indigo-200">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tracking ID:</p>
                <p className="text-indigo-800 text-xl font-bold">{orderData.trackingId}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Order Number:</p>
                <p className="text-indigo-800 text-xl font-bold">{orderData.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Status:</p>
                <p className={`text-2xl font-extrabold ${orderData.status === 'Delivered' ? 'text-green-600' : 'text-indigo-700'}`}>
                  {orderData.status}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Estimated Delivery:</p>
                <p className="text-indigo-800 text-xl font-bold">{orderData.estimatedDelivery}</p>
              </div>
            </div>

            <p className="text-gray-700 text-base mb-8 italic text-center sm:text-left">{orderData.message}</p>
            
            {/* Timeline Display */}
            {renderTimeline()}

            {/* Additional Details */}
            <div className="mt-10 border-t pt-6 border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-800 mb-4">Delivery Details</h3>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Delivery Address:</span> {orderData.deliveryAddress}
              </p>

              <h3 className="text-2xl font-bold text-indigo-800 mt-6 mb-4">Order Items</h3>
              <ul className="list-disc list-inside space-y-2">
                {orderData.items.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item.name} (Qty: {item.qty}) - ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;