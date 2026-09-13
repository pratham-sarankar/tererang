import React from 'react';
import { Footer } from '../components/Footer';

const ACCENT_COLOR_CLASS = 'text-primary';
const ACCENT_BG_CLASS = 'bg-primary';
const ACCENT_BORDER_CLASS = 'border-primary';
const HIGHLIGHT_COLOR_CLASS = 'text-accent';

// --- Reusable Components ---

const InfoCard = ({ iconClass, title, content }) => (
    <div className="bg-card p-6 h-full rounded-sm shadow-sm border border-border text-center transition duration-300">
        <i className={`${iconClass} text-4xl ${ACCENT_COLOR_CLASS} mb-3`}></i>
        <h3 className={`text-xl font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mb-2`}>{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
);

const PolicyBox = ({ iconClass, title, children }) => (
    <div className={`bg-card p-6 h-full rounded-sm shadow-sm border border-border border-l-4 ${ACCENT_BORDER_CLASS} text-left`}>
        <div className="flex items-center mb-4">
            <i className={`${iconClass} text-2xl ${ACCENT_COLOR_CLASS} mr-3`}></i>
            <h3 className={`text-xl font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS}`}>{title}</h3>
        </div>
        {children}
    </div>
);


// --- Main Application Component ---
const App = () => {
    return (
        <>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js" defer></script>
            <div className="font-sans bg-background min-h-screen text-foreground">

                {/* Header Section - sage */}
                <header className={`${ACCENT_BG_CLASS} text-white py-12 mb-12 shadow-sm`}>
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl font-serif lowercase tracking-wide mb-2">
                            <span className="text-white">tererang</span>
                        </h1>
                        <p className="text-xl font-light opacity-80 lowercase tracking-wide">
                            terms & conditions
                        </p>
                    </div>
                </header>

                {/* Main Content Area: Terms and Conditions */}
                <main>
                    <div className="max-w-6xl mx-auto px-6 pb-16">

                        {/* Introduction */}
                        <div className={`bg-card p-10 rounded-sm mb-12 shadow-sm border border-border border-l-4 ${ACCENT_BORDER_CLASS} text-left`}>

                            <div className="flex items-center mb-4 space-x-4">
                                <i className={`fas fa-scroll text-5xl ${ACCENT_COLOR_CLASS}`}></i>
                                <h2 className="text-3xl font-serif lowercase tracking-wide text-foreground">
                                    welcome to tererang!
                                </h2>
                            </div>

                            <p className="text-base leading-relaxed text-muted-foreground border-t pt-4 mt-4 border-border">
                                We are committed to providing a transparent and satisfying shopping experience built on elegance and trust. Please review our store policies carefully before placing an order. By accessing or using our website, and by making a purchase, you agree to be bound by these terms and conditions.
                            </p>
                            <p className="text-sm mt-4 text-muted-foreground">
                                Last Updated: October 15, 2025
                            </p>
                        </div>

                        {/* Detailed Sections Container */}
                        <div className="space-y-10">

                            {/* 1. Product and Order Terms */}
                            <div className="bg-card p-8 shadow-sm border border-border rounded-sm">
                                <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-6 border-b border-border pb-3 text-center`}>1. product & order terms</h2>

                                <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>order confirmation and availability</h3>
                                <p className="text-muted-foreground text-left leading-relaxed text-sm">
                                    All orders are subject to product availability and the confirmation of the order price. While we strive to maintain accurate inventory, placing an item in your cart does not guarantee its availability.
                                </p>

                                <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>product images and colors</h3>
                                <p className="text-muted-foreground text-left leading-relaxed text-sm">
                                    We make every effort to display the colors and details of our products accurately. However, colors may vary slightly due to individual screen settings, lighting conditions during photography, and natural variations in the fabric dyes. We cannot guarantee that your device's display of any color will accurately reflect the product's true color.
                                </p>

                                <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>size information (mandatory check)</h3>
                                <div className="bg-secondary p-4 rounded-sm border border-border text-left">
                                    <p className="font-medium text-foreground mb-3 text-sm">Important Size Guidelines</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 text-sm">
                                        <li className="text-sm text-foreground"><span className={`font-medium ${HIGHLIGHT_COLOR_CLASS}`}>Please always refer to our specific size chart</span> before placing your order.</li>
                                        <li>All sizes mentioned in our size charts are in <span className="font-medium">inches</span>.</li>
                                        <li>Accurate measurements help ensure a perfect fit and prevent sizing issues, as returns based on fit are subject to the strict policy outlined below.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 2. Payment, Cancellation, and Refund Policy */}
                            <div className="bg-card p-8 shadow-sm border border-border rounded-sm">
                                <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-6 border-b border-border pb-3 text-center`}>2. payment, cancellation & refunds</h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Payment Policy Card (Left) */}
                                    <PolicyBox iconClass="fas fa-credit-card" title="payment policy">
                                        <div className="bg-secondary p-4 rounded-sm border border-border border-l-4 border-destructive mb-4">
                                            <p className="font-medium text-destructive text-sm">
                                                <i className="fas fa-exclamation-triangle mr-2"></i> No Cash on Delivery (COD)
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We <span className="font-medium text-foreground">do not</span> offer Cash on Delivery (COD) services. All orders must be <span className={`font-medium ${HIGHLIGHT_COLOR_CLASS}`}>prepaid</span> through the secure payment options available at checkout, including credit/debit cards, UPI, net banking, and digital wallets.
                                        </p>
                                    </PolicyBox>

                                    {/* Cancellation Policy Card (Right) */}
                                    <PolicyBox iconClass="fas fa-redo-alt" title="order cancellation">
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 text-sm">
                                            <li className={`text-sm text-foreground`}><span className={`font-medium ${HIGHLIGHT_COLOR_CLASS}`}>Orders can be cancelled within 12 hrs</span> once payment is confirmed.</li>
                                            <li>Please double-check your order details before making payment.</li>
                                        </ul>

                                        <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 border-t pt-3 border-border`}>refund policy</h3>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 text-sm">
                                            <li>Refunds are processed <span className="font-medium">only for approved store errors</span> (see Section 3).</li>
                                            <li>Refund processing time: <span className="font-medium">5-7 business days</span> after the item is received and inspected.</li>
                                            <li>Refunds will be credited to the <span className="font-medium">original payment method</span>.</li>
                                        </ul>
                                    </PolicyBox>
                                </div>
                            </div>


                            {/* 3. Return & Exchange Policy (Store Errors Only) */}
                            <div className="bg-card p-8 shadow-sm border border-border rounded-sm">
                                <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-6 border-b border-border pb-3 text-center`}>3. return & exchange policy</h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* General Policy Card (Left) */}
                                    <PolicyBox iconClass="fas fa-shipping-fast" title="general policy">
                                        <p className="text-muted-foreground leading-relaxed text-sm">
                                            We maintain a strict quality control process. We <span className="font-medium text-foreground">do not accept refunds or exchanges</span> unless the error is clearly from our side ("Store Errors"). Kindly double-check your order details, size, and color before confirming your purchase.
                                        </p>
                                    </PolicyBox>

                                    {/* Returns Accepted Card (Right) */}
                                    <PolicyBox iconClass="fas fa-check-circle" title="no returns, exchange accepted only for store errors.">
                                        <p className="font-medium text-muted-foreground text-sm mb-2">An exchange will be accepted ONLY if:</p>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 text-sm">
                                            <li>We sent the <span className="font-medium">wrong item, wrong size</span>, or a <span className="font-medium">defective product</span>.</li>
                                            <li className={`text-sm text-foreground`}>A <span className={`font-medium ${HIGHLIGHT_COLOR_CLASS}`}>full unboxing video</span> is provided as proof. The video must be <span className="font-medium">uncut and continuous</span> from the moment the sealed package is opened.</li>
                                            <li>The exchange process is initiated within <span className="font-medium">2-3 days</span> of receiving the order. Requests after this window will not be accepted.</li>
                                        </ul>
                                    </PolicyBox>
                                </div>
                            </div>

                            {/* 4. Additional Terms */}
                            <div className="bg-card p-8 shadow-sm border border-border rounded-sm">
                                <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-6 border-b border-border pb-3 text-center`}>4. additional terms</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

                                    <InfoCard
                                        iconClass="fas fa-box-open"
                                        title="order confirmation"
                                        content="All orders are subject to availability and confirmation of the order price."
                                    />

                                    <InfoCard
                                        iconClass="fas fa-palette"
                                        title="product images"
                                        content="Colors may vary slightly due to screen settings and lighting conditions."
                                    />

                                    <InfoCard
                                        iconClass="fas fa-headset"
                                        title="customer support"
                                        content="Contact our support team for any queries before placing your order."
                                    />
                                </div>
                            </div>

                            {/* 5. General Legal Provisions */}
                            <div className="bg-card p-8 shadow-sm border border-border rounded-sm">
                                <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-6 border-b border-border pb-3 text-center`}>5. general legal provisions</h2>

                                <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>intellectual property</h3>
                                <p className="text-muted-foreground text-left leading-relaxed text-sm">
                                    All content on the Tererang website, including designs, text, graphics, logos, images, and software, is the property of Tererang and protected by intellectual property laws. You may not use any content without our express written permission.
                                </p>

                                <h3 className={`text-lg font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mt-6 mb-2 text-center`}>governing law</h3>
                                <p className="text-muted-foreground text-left leading-relaxed text-sm">
                                    These Terms and Conditions shall be governed by and construed in accordance with the laws of <span className="font-medium">India</span>, with the exclusive jurisdiction of courts in <span className="font-medium">Noida, Uttar Pradesh</span>.
                                </p>
                            </div>

                        </div>

                        {/* Footer Contact Note */}
                        <div className="mt-12 text-center bg-secondary p-8 shadow-sm rounded-sm border border-border">
                            <p className={`text-2xl font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mb-3`}>
                                thank you for shopping with tererang!
                            </p>
                            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                                We appreciate your understanding and cooperation. For any queries, feel free to contact our support team before placing your order.
                            </p>
                            <p className="text-sm mt-4 text-muted-foreground">
                                Last Updated: October 15, 2025
                            </p>
                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default App;
