export const Footer = () => (
    <footer className="bg-secondary text-foreground pt-20 pb-10 mt-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Info */}
            <div>
                <h2 className="text-3xl font-serif lowercase text-foreground mb-3 tracking-wide">tererang</h2>
                <p className="italic text-base mb-4 text-accent font-serif">"curated with love. crafted with purpose. designed to become part of your story."</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    born from passion and heritage, tererang reimagines indian couture with understated elegance and bespoke craftsmanship.
                </p>
                <div className="flex space-x-4 mt-5">
                    <a href="https://www.instagram.com/tererang.official/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="https://wa.me/919548971147" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                </div>
            </div>

            {/* Collections */}
            <div>
                <h3 className="text-lg font-serif lowercase text-foreground mb-5">collections</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="/products/Kurti" className="hover:text-primary transition lowercase">stylish kurtis</a></li>
                    <li><a href="/products/suit" className="hover:text-primary transition lowercase">designer suits</a></li>
                    <li><a href="/products/wedding" className="hover:text-primary transition lowercase">wedding collection</a></li>
                    <li><a href="/products/EthnicWear" className="hover:text-primary transition lowercase">winter ethnic wear</a></li>
                    <li><a href="/products/coat" className="hover:text-primary transition lowercase">elegant coat sets</a></li>
                </ul>
            </div>

            {/* The Studio */}
            <div>
                <h3 className="text-lg font-serif lowercase text-foreground mb-5">the studio</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="/MyOrder" className="hover:text-primary transition lowercase">my orders</a></li>
                    <li><a href="/Shipping" className="hover:text-primary transition lowercase">shipping & returns</a></li>
                    <li><a href="/TermsPage" className="hover:text-primary transition lowercase">terms & conditions</a></li>
                    <li><a href="/privacy-policy" className="hover:text-primary transition lowercase">privacy policy</a></li>
                    <li><a href="/FaqPage" className="hover:text-primary transition lowercase">faq</a></li>
                </ul>
            </div>

            {/* Contact */}
            <div>
                <h3 className="text-lg font-serif lowercase text-foreground mb-5">boutique care</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start">
                        <span className="mr-2">📍</span>
                        <span>moradabad, uttar pradesh, india</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">📞</span>
                        <a href="tel:+919548971147" className="hover:text-primary transition">+91 9548971147</a>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✉️</span>
                        <a href="mailto:tererangofficial@gmail.com" className="hover:text-primary transition">tererangofficial@gmail.com</a>
                    </li>
                    <li className="mt-4">
                        <a href="https://wa.me/919548971147" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:opacity-80 transition lowercase text-xs tracking-wide">
                            💬 whatsapp designer desk
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <div className="mb-2">
                © 2026 <span className="text-primary font-medium lowercase">tererang</span>. all rights reserved.
            </div>
            <div className="lowercase">
                bespoke indian couture · moradabad studio
            </div>
        </div>
    </footer>
);
