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
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    <p className="ml-3 text-primary font-medium">Fetching status...</p>
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
        {/* Full border line for the background */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border transform -translate-y-1/2 mx-8"></div>
        {/* Active sage line */}
        <div
          className="absolute top-1/2 left-0 h-px bg-primary transform -translate-y-1/2 mx-8 transition-all duration-700 ease-in-out"
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
                              text-white text-base font-medium transition-all duration-500 border
                              ${isActive ? 'bg-primary border-primary shadow-sm' : 'bg-card border-border text-muted-foreground'}`}
                >
                  {stepNumber}
                </div>
                {/* Step Name */}
                <p className={`mt-3 text-sm font-medium transition-colors duration-500
                              ${isActive ? 'text-primary' : 'text-muted-foreground'}
                              ${isCurrent ? 'font-medium text-base text-foreground' : ''}`}
                >
                  {step.name}
                </p>
                {step.date &&
                  <p className="text-xs text-muted-foreground mt-1">{step.date}</p>
                }
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-5xl w-full bg-card shadow-sm rounded-sm p-8 sm:p-12 border border-border">
        <h1 className="text-5xl font-serif lowercase tracking-wide text-center text-foreground mb-8 sm:mb-12">
          <span className="block text-3xl font-light text-muted-foreground mb-2 lowercase">my order</span>
          track your delivery
        </h1>

        {/* Tracking Input Section */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
          <input
            type="text"
            placeholder="Enter your Tracking ID (e.g., 12345 or 67890)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-grow p-4 border border-border rounded-sm text-lg text-foreground
                       focus:ring-primary focus:border-primary transition duration-200 shadow-sm
                       placeholder:text-muted-foreground"
          />
          <button
            onClick={handleTrackOrder}
            disabled={isLoading}
            className="px-8 py-4 bg-primary text-white text-xl font-medium lowercase tracking-wide rounded-sm
                       hover:bg-primary/90 disabled:bg-primary/50 transition duration-300
                       shadow-sm"
          >
            {isLoading ? 'Tracking...' : 'Track Order'}
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && <Spinner />}

        {/* Error Message */}
        {error && (
          <div className="p-5 bg-secondary text-destructive font-medium rounded-sm mb-8 border border-border text-center">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Order Details Display */}
        {orderData && (
          <div className="bg-secondary p-6 sm:p-10 rounded-sm border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6 border-border">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Tracking ID:</p>
                <p className="text-primary text-xl font-medium">{orderData.trackingId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Order Number:</p>
                <p className="text-primary text-xl font-medium">{orderData.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Current Status:</p>
                <p className={`text-2xl font-serif lowercase ${orderData.status === 'Delivered' ? 'text-accent' : 'text-primary'}`}>
                  {orderData.status}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Estimated Delivery:</p>
                <p className="text-primary text-xl font-medium">{orderData.estimatedDelivery}</p>
              </div>
            </div>

            <p className="text-foreground text-base mb-8 italic text-center sm:text-left">{orderData.message}</p>

            {/* Timeline Display */}
            {renderTimeline()}

            {/* Additional Details */}
            <div className="mt-10 border-t pt-6 border-border">
              <h3 className="text-2xl font-serif lowercase tracking-wide text-foreground mb-4">delivery details</h3>
              <p className="text-foreground mb-2">
                <span className="font-medium">Delivery Address:</span> {orderData.deliveryAddress}
              </p>

              <h3 className="text-2xl font-serif lowercase tracking-wide text-foreground mt-6 mb-4">order items</h3>
              <ul className="list-disc list-inside space-y-2">
                {orderData.items.map((item, index) => (
                  <li key={index} className="text-foreground">
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