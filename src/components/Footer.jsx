import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HOME_FOOTER_COLS = [
  {
    title: "Collections",
    links: [
      ["Stylish Kurtis", "/products/Kurti"],
      ["Designer Suits", "/products/Suit"],
      ["Wedding Collection", "/products/wedding"],
      ["Winter Ethnic Wear", "/products/EthnicWear"],
      ["Elegant Coat Sets", "/products/Coat"],
    ],
  },
  {
    title: "The Studio",
    links: [
      ["My Orders", "/MyOrder"],
      ["Shipping & Returns", "/Shipping"],
      ["Terms & Conditions", "/TermsPage"],
      ["Privacy Policy", "/privacy-policy"],
      ["FAQ", "/FaqPage"],
    ],
  },
  {
    title: "Info",
    links: [
      ["About Us", "/contact"],
      ["Contact", "/contact"],
    ],
  },
];

const HomeFooter = () => (
  <footer className="home-footer">
    <div className="home-container">
      <div className="home-footer-grid">
        {/* Brand column */}
        <div className="home-footer-brand home-footer-col">
          <Link to="/" className="home-footer-logo">tererang</Link>
          <p>
            A Moradabad boutique reimagining Indian couture through breathable fabrics, bespoke finishing, and modern heritage dressing.
          </p>
          <div className="home-footer-socials">
            <a href="https://www.instagram.com/tererang.official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <a href="https://wa.me/919548971147" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle size={15} />
            </a>
            <a href="mailto:tererangofficial@gmail.com" aria-label="Email">
              <Mail size={15} />
            </a>
          </div>
        </div>

        {/* Link columns */}
        {HOME_FOOTER_COLS.map((col) => (
          <div key={col.title} className="home-footer-col">
            <h4>{col.title}</h4>
            {col.links.map(([label, to]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        ))}

        {/* Contact column */}
        <div className="home-footer-col">
          <h4>Boutique Support</h4>
          <a href="mailto:tererangofficial@gmail.com">tererangofficial@gmail.com</a>
          <a href="tel:+919548971147">+91 9548971147</a>
          <a href="https://wa.me/919548971147" target="_blank" rel="noopener noreferrer">Chat with designer ↗</a>
          <p style={{ fontSize: "12px", color: "#a99da7", marginTop: "8px", lineHeight: 1.6 }}>
            Moradabad, Uttar Pradesh, India
          </p>
        </div>
      </div>

      <div className="home-footer-bottom">
        <span>© 2026 Tererang. All rights reserved.</span>
        <div style={{ display: "flex", gap: "18px" }}>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/TermsPage">Terms</Link>
        </div>
      </div>
    </div>
  </footer>
);

export const Footer = ({ variant } = {}) => variant === "home" ? <HomeFooter /> : (
  <footer className="border-t border-border bg-secondary text-foreground">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.25fr_0.75fr_0.75fr_1fr] lg:px-10">
      <div>
        <h2 className="font-serif text-5xl lowercase leading-none text-foreground">tererang</h2>
        <p className="mt-4 max-w-sm font-serif text-lg italic leading-8 text-accent">
          Curated with love. Crafted with purpose. Designed to become part of your story.
        </p>
        <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
          A Moradabad boutique reimagining Indian couture through breathable fabrics, bespoke finishing, and modern heritage dressing.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="https://www.instagram.com/tererang.official/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://wa.me/919548971147"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl lowercase text-foreground">collections</h3>
        <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
          <li><Link to="/products/Kurti" className="transition hover:text-primary">Stylish Kurtis</Link></li>
          <li><Link to="/products/Suit" className="transition hover:text-primary">Designer Suits</Link></li>
          <li><Link to="/products/wedding" className="transition hover:text-primary">Wedding Collection</Link></li>
          <li><Link to="/products/EthnicWear" className="transition hover:text-primary">Winter Ethnic Wear</Link></li>
          <li><Link to="/products/Coat" className="transition hover:text-primary">Elegant Coat Sets</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-serif text-2xl lowercase text-foreground">the studio</h3>
        <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
          <li><Link to="/MyOrder" className="transition hover:text-primary">My Orders</Link></li>
          <li><Link to="/Shipping" className="transition hover:text-primary">Shipping & Returns</Link></li>
          <li><Link to="/TermsPage" className="transition hover:text-primary">Terms & Conditions</Link></li>
          <li><Link to="/privacy-policy" className="transition hover:text-primary">Privacy Policy</Link></li>
          <li><Link to="/FaqPage" className="transition hover:text-primary">FAQ</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-serif text-2xl lowercase text-foreground">boutique care</h3>
        <ul className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
          <li className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" /> Moradabad, Uttar Pradesh, India</li>
          <li className="flex gap-3"><Phone className="mt-1 h-4 w-4 shrink-0 text-primary" /> <a href="tel:+919548971147" className="transition hover:text-primary">+91 9548971147</a></li>
          <li className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-primary" /> <a href="mailto:tererangofficial@gmail.com" className="transition hover:text-primary">tererangofficial@gmail.com</a></li>
        </ul>
        <a
          href="https://wa.me/919548971147"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 border border-primary px-5 py-3 text-xs font-semibold lowercase tracking-[0.2em] text-foreground transition hover:bg-primary hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
          designer desk
        </a>
      </div>
    </div>

    <div className="border-t border-border px-6 py-6 text-center text-xs lowercase tracking-[0.18em] text-muted-foreground">
      © 2026 tererang. all rights reserved.
    </div>
  </footer>
);
