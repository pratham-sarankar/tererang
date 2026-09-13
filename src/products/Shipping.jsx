import React from "react";
// Lucide icons are used for visual appeal
import { Truck, ShieldCheck, Package, AlertTriangle, MapPin, Phone, MessageSquare, Facebook, Instagram, Twitter, Youtube, CheckCircle } from "lucide-react";
import { Footer } from "../components/Footer";

// --- Custom Helper Components (Luxury Boutique Design) ---

// Base styling for all main content boxes
const BaseBox = ({ children, bgColor = "bg-card", className = "" }) => (
    <div className={`${bgColor} p-6 rounded-sm shadow-sm border border-border ${className}`}>
        {children}
    </div>
);

// Helper component for individual text blocks
const InnerContentBox = ({ title, children, isCentered = true, bgColor = "bg-card" }) => (
    <div className={`${bgColor} p-4 border border-border rounded-sm shadow-sm h-full`}>
        <h3 className={`font-serif lowercase tracking-wide text-xl text-foreground mb-3 ${isCentered ? 'text-center' : ''}`}>{title}</h3>
        <div className={`text-foreground font-medium text-base ${isCentered ? 'text-center' : 'text-left'}`}>
            {children}
        </div>
    </div>
);

// ----------------------------------------------------------------------

const ShippingPolicy = () => {

    // Define consistent primary colors for headers/accents
    const PrimaryColor = "text-primary";
    const AccentColor = "text-accent";

    // Custom section background colors
    const sectionColors = {
        process: "bg-secondary",
        areas: "bg-secondary",
        charges: "bg-secondary",
        guidelines: "bg-secondary",
        support: "bg-secondary"
    };

    return (
        <div className="bg-background text-foreground min-h-screen font-serif">

            {/* Header - sage */}
            <header className="bg-primary text-white py-12 px-6 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <Truck className="text-white" size={40} />
                        <h1 className="text-5xl font-serif lowercase tracking-wide text-white">tererang store's</h1>
                    </div>
                    <p className="text-3xl font-light opacity-90 mt-1 lowercase tracking-wide">shipping policy</p>
                    <div className="w-20 h-px bg-white opacity-70 mt-4"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto py-16 px-6 sm:px-10">

                {/* Introductory Box */}
                <BaseBox className="mb-16 bg-card">
                    <p className="text-foreground text-xl italic text-center font-normal leading-relaxed">
                        At <span className="font-medium text-primary">Tererang</span>, we ensure safe and timely delivery of your orders. Please review our shipping policies to
                        understand our delivery process, timelines, and terms.
                    </p>
                </BaseBox>

                {/* Shipping Process */}
                <section className="mb-12">
                    <h2 className={`text-4xl font-serif lowercase tracking-wide flex items-center gap-3 mb-8 ${PrimaryColor}`}>
                        <Package className={AccentColor} size={36} /> shipping process
                    </h2>
                    <BaseBox bgColor={sectionColors.process} className="p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "1", title: "Order Confirmation", desc: "Your order is confirmed and payment is processed." },
                                { step: "2", title: "Processing", desc: "Your order is packed and prepared for shipping." },
                                { step: "3", title: "Shipped", desc: "Your order is dispatched with tracking details." },
                            ].map((item, idx) => (
                                <InnerContentBox key={idx} title={item.title} bgColor="bg-card">
                                    <div className={`text-6xl font-serif lowercase ${AccentColor} mb-3`}>{item.step}</div>
                                    <p>{item.desc}</p>
                                </InnerContentBox>
                            ))}
                        </div>

                        <div className="mt-10 pt-6 border-t border-border p-4 border border-border rounded-sm bg-card shadow-sm">
                            <h4 className={`font-serif lowercase tracking-wide flex items-center justify-center gap-2 text-2xl ${PrimaryColor} mb-3`}>
                                <Phone size={24} className={AccentColor} /> order tracking
                            </h4>
                            <p className="text-center text-base">
                                Once your order is shipped, you will receive a tracking number via SMS and email. You can track your package in real-time using this tracking ID.
                            </p>
                        </div>
                    </BaseBox>
                </section>

                {/* Shipping Areas & Delivery Time */}
                <section className="mb-12">
                    <h2 className={`text-4xl font-serif lowercase tracking-wide flex items-center gap-3 mb-8 ${PrimaryColor}`}>
                        <MapPin className={AccentColor} size={36} /> shipping areas & delivery time
                    </h2>
                    <BaseBox bgColor={sectionColors.areas} className="p-8 grid md:grid-cols-2 gap-8">
                        <InnerContentBox title="Delivery Coverage" bgColor="bg-card">
                            <ul className="pl-0 text-foreground space-y-2 list-none">
                                <li className="flex items-center justify-center gap-2"><CheckCircle className="text-primary" size={20} /> All major cities across India</li>
                                <li className="flex items-center justify-center gap-2"><CheckCircle className="text-primary" size={20} /> Tier 2 and Tier 3 cities</li>
                                <li className="flex items-center justify-center gap-2"><CheckCircle className="text-primary" size={20} /> Most PIN codes serviceable</li>
                                <li className="flex items-center justify-center gap-2 text-accent font-medium"><AlertTriangle size={20} /> Remote areas may take additional time</li>
                            </ul>
                        </InnerContentBox>

                        <InnerContentBox title="Delivery Timeline" bgColor="bg-card">
                            <div className={`flex items-center justify-center gap-2 text-lg font-medium ${PrimaryColor}`}>
                                <Truck className={AccentColor} size={24} />
                                Standard Delivery
                            </div>
                            <p className={`text-3xl font-serif lowercase ${AccentColor} mt-2 mb-4`}>8-9 business days</p>
                            <p className="text-sm bg-secondary p-3 rounded-sm border border-border">
                                <span className="font-medium">Note:</span> Delivery time starts counting from the day your order is <span className="font-medium text-foreground">shipped</span>, not from the day it was placed.
                            </p>
                        </InnerContentBox>
                    </BaseBox>
                </section>

                {/* Shipping Charges & Packaging */}
                <section className="grid md:grid-cols-2 gap-8 mb-12">
                    <BaseBox bgColor={sectionColors.charges} className="p-6">
                        <h2 className={`text-3xl font-serif lowercase tracking-wide flex items-center gap-2 mb-4 ${PrimaryColor}`}>
                            <ShieldCheck className={AccentColor} size={30} /> shipping charges
                        </h2>
                        <InnerContentBox title="Free Shipping" isCentered={false} bgColor="bg-card">
                            <ul className="list-disc pl-6 text-foreground space-y-1 text-left">
                                <li>We offer free shipping on all orders across India!</li>
                                <li>No minimum order value required</li>
                                <li>No hidden charges</li>
                                <li>Applicable to all PIN codes we serve</li>
                            </ul>
                            <p className="text-sm bg-secondary p-2 rounded-sm mt-3 text-center border border-border">
                                <span className="font-medium">Note:</span> Remote locations might experience slight delays but no additional charges.
                            </p>
                        </InnerContentBox>
                    </BaseBox>

                    <BaseBox bgColor={sectionColors.guidelines} className="p-6">
                        <h2 className={`text-3xl font-serif lowercase tracking-wide flex items-center gap-2 mb-4 ${PrimaryColor}`}>
                            <Package className={AccentColor} size={30} /> packaging
                        </h2>
                        <InnerContentBox title="Safe & Secure Packaging" isCentered={false} bgColor="bg-card">
                            <ul className="list-disc pl-6 text-foreground space-y-1 text-left">
                                <li>High-quality packaging materials</li>
                                <li>Bubble wrap protection for delicate items</li>
                                <li>Branded packaging with care instructions</li>
                                <li>Tamper-proof sealing</li>
                            </ul>
                        </InnerContentBox>
                    </BaseBox>
                </section>

                {/* Delivery Guidelines */}
                <section className="mb-12">
                    <h2 className={`text-4xl font-serif lowercase tracking-wide flex items-center gap-3 mb-8 ${PrimaryColor}`}>
                        <AlertTriangle className={AccentColor} size={36} /> delivery guidelines & important notes
                    </h2>
                    <BaseBox bgColor={sectionColors.support} className="p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <InnerContentBox title="Delivery Attempts" bgColor="bg-card">
                                <ul className="list-none pl-0 text-foreground space-y-1 text-center">
                                    <li>Our delivery partner will make <span className="font-medium">3 delivery attempts</span></li>
                                    <li>Please ensure someone is available to receive the package</li>
                                    <li>If all attempts fail, the package will be returned</li>
                                </ul>
                            </InnerContentBox>
                            <InnerContentBox title="Undeliverable Orders" bgColor="bg-card">
                                <ul className="list-none pl-0 text-foreground space-y-1 text-center">
                                    <li>Incorrect/incomplete address</li>
                                    <li>Customer not available after multiple attempts</li>
                                    <li>Refused to accept delivery</li>
                                </ul>
                                <p className="text-sm text-accent mt-2">*Return shipping charges may apply for undeliverable orders</p>
                            </InnerContentBox>
                            <div className="md:col-span-2 pt-4">
                                <InnerContentBox title="Address Requirements" bgColor="bg-card">
                                    <p className="text-base">
                                        Please provide <span className="font-medium">complete and accurate address details</span> including landmarks, PIN code, and a working phone number for smooth delivery.
                                    </p>
                                </InnerContentBox>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <InnerContentBox title="Delivery Confirmation" bgColor="bg-card">
                                    <p className="text-base">
                                        Please <span className="font-medium">inspect your package upon delivery</span> and report any damage or discrepancies immediately to our customer support.
                                    </p>
                                </InnerContentBox>
                            </div>
                        </div>
                    </BaseBox>
                </section>

                {/* Shipping Support */}
                <section className="mb-12">
                    <BaseBox bgColor="bg-card" className="p-8">
                        <h2 className={`text-3xl font-serif lowercase tracking-wide flex items-center justify-center gap-2 ${PrimaryColor} mb-4`}>
                            <MessageSquare className={AccentColor} size={30} /> shipping support
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InnerContentBox title="Delivery Issues" bgColor="bg-secondary">
                                <p className="text-foreground">
                                    If you face any issues with delivery, tracking, or package condition, <span className="font-medium">please contact our support team immediately.</span>
                                </p>
                                <p className="text-primary font-medium mt-1">We will resolve your concern within 24 hours.</p>
                            </InnerContentBox>
                            <InnerContentBox title="Track Your Order" bgColor="bg-secondary">
                                <p className="text-foreground">
                                    Use the tracking number provided in your shipping confirmation email to track your package in real-time on our website or the courier partner's website.
                                </p>
                            </InnerContentBox>
                        </div>
                    </BaseBox>
                </section>

                {/* Final Message */}
                <section className="text-center py-10 border border-border p-6 rounded-sm bg-card shadow-sm">
                    <p className="text-xl font-medium text-foreground mb-4 leading-relaxed">
                        We are committed to delivering your orders safely and on time.
                        <br />
                        For any shipping-related queries, our customer support team is here to help.
                    </p>
                    <div className="text-4xl font-serif lowercase text-foreground">
                        Thank you for choosing <span className="bg-primary text-white px-3 py-1 rounded-sm shadow-sm tracking-wide">tererang!</span>
                    </div>
                    <p className="text-base text-muted-foreground mt-6">Last updated: 18 September 2025</p>
                </section>
            </main>

            {/* --- STYLISH FOOTER --- */}
            <Footer></Footer>
        </div>
    );
};

export default ShippingPolicy;