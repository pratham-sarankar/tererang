import React from 'react';
import { Footer } from '../components/Footer';

const ACCENT_COLOR_CLASS = 'text-primary';
const ACCENT_BG_CLASS = 'bg-primary';
const ACCENT_BORDER_CLASS = 'border-primary';

// Secondary Highlight Color (Gold for Premium/Deals)
const HIGHLIGHT_COLOR_CLASS = 'text-accent';
const HIGHLIGHT_BG_CLASS = 'bg-secondary';

// --- Reusable Components ---

// Component for a single Offer Card
const OfferCard = ({ title, description, code, condition, icon }) => (
    <div className={`bg-card p-6 rounded-sm shadow-sm border-t-4 ${ACCENT_BORDER_CLASS} flex flex-col items-center text-center h-full border border-border transition duration-300`}>
        <div className={`p-4 rounded-full ${HIGHLIGHT_BG_CLASS} mb-4 border border-border`}>
            <i className={`${icon} text-3xl ${HIGHLIGHT_COLOR_CLASS}`}></i>
        </div>
        <h3 className={`text-2xl font-serif lowercase tracking-wide ${ACCENT_COLOR_CLASS} mb-2`}>{title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow text-sm leading-relaxed">{description}</p>

        {code && (
            <div className="w-full mt-auto">
                <p className="text-sm font-medium text-muted-foreground mb-1 lowercase">use code</p>
                <div className="bg-secondary border border-border border-dashed p-2 rounded-sm font-mono text-lg font-bold text-foreground tracking-wider select-all">
                    {code}
                </div>
            </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 italic">{condition}</p>
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
                            <span className="text-white">tererang deals & rewards</span>
                        </h1>
                        <p className="text-xl font-light opacity-80 lowercase tracking-wide">
                            elegance always comes with a reward. explore our ongoing offers!
                        </p>
                    </div>
                </header>

                {/* Main Content Area: Offers */}
                <main>
                    <div className="max-w-7xl mx-auto px-6 pb-16 text-center">

                        {/* Featured Callout - VIP Style */}
                        <div className={`bg-card p-10 rounded-sm mb-16 shadow-sm border-b-4 ${ACCENT_BORDER_CLASS} relative overflow-hidden border border-border`}>
                            <div className="absolute top-0 right-0 p-4 transform rotate-12 text-2xl font-serif lowercase text-white bg-primary rounded-bl-sm shadow-sm tracking-wide">
                                vip
                            </div>
                            <h2 className="text-3xl font-serif lowercase tracking-wide text-foreground mb-2">
                                new customer welcome offer
                            </h2>
                            <p className={`text-5xl font-serif lowercase ${ACCENT_COLOR_CLASS} mb-4 tracking-wide`}>
                                flat 10% off
                            </p>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Start your journey with Tererang. Enjoy an exclusive discount on your very first purchase.
                            </p>
                            {/* SHOP NOW LINK CHANGE: /signup to / */}
                            <a href="/" className={`mt-5 inline-block ${ACCENT_BG_CLASS} text-white font-medium lowercase tracking-wide py-3 px-8 rounded-full shadow-sm hover:bg-primary/90 transition duration-300 text-sm`}>
                                shop now & claim your discount
                            </a>
                        </div>

                        {/* Section 1: Always-On Discounts */}
                        <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mb-10 border-b border-border pb-3 inline-block`}>
                            year-round discounts
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            <OfferCard
                                icon="fas fa-truck"
                                title="free shipping"
                                description="Enjoy complimentary standard shipping on all orders above a minimum purchase value. Shop more, save more on delivery!"
                                condition="Minimum cart value of ₹4999 applies."
                            />

                            <OfferCard
                                icon="fas fa-box-open"
                                title="bundle & save 15%"
                                description="Mix and match any two Kurtis or Salwar Suits and automatically receive 15% off the total bundle price at checkout."
                                code="TERABUNDLE"
                                condition="Applies to select collections only."
                            />

                            <OfferCard
                                icon="fas fa-gift"
                                title="loyalty reward"
                                description="Get a special gift voucher worth ₹500 on your 5th confirmed purchase with Tererang."
                                condition="Automatic credit after 5th order delivery."
                            />

                        </div>

                        {/* Section 2: Special Offers & Rewards */}
                        <h2 className={`text-3xl font-serif lowercase tracking-wide text-foreground mt-20 mb-10 border-b border-border pb-3 inline-block`}>
                            exclusive rewards
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            <OfferCard
                                icon="fas fa-birthday-cake"
                                title="birthday special"
                                description="Celebrate your special day with a flat 20% discount code, valid for one month before or after your birthday."
                                code="HBD20"
                                condition="Must be registered on our site for 6+ months with verified date of birth."
                            />

                            <OfferCard
                                icon="fas fa-hand-holding-heart"
                                title="refer & earn"
                                description="Refer a friend! They get 10% off their first order, and you receive a ₹250 credit when they complete their purchase."
                                condition="Credit applied after friend's first order is successfully delivered."
                            />

                        </div>

                        {/* Terms & Conditions CTA */}
                        <div className={`mt-16 bg-secondary p-8 rounded-sm border-l-4 ${ACCENT_BORDER_CLASS} border border-border`}>
                            <p className="text-xl font-medium text-foreground mb-3 lowercase">
                                terms apply to all offers
                            </p>
                            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                All promotional codes and offers are subject to specific conditions, availability, and Tererang's right to withdraw or modify the promotion at any time.
                            </p>
                            {/* TERMS LINK CONFIRMED: Already points to /terms */}
                            <a href="/TermsPage" className={`text-sm font-medium ${ACCENT_COLOR_CLASS} hover:underline lowercase tracking-wide`}>
                                read full terms & conditions page <i className="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default App;
