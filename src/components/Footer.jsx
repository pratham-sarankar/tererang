import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const HomeFooter = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link className="footer-logo" to="/" aria-label="Tere Rang">
              <img src={logo} alt="Tere Rang" />
            </Link>
            <p>Expressive fashion, refined silhouettes, and colour with intention.</p>
          </div>

          {/* Col 1: Shop */}
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">New Arrivals</Link>
            <Link to="/products/wedding">Best Sellers</Link>
            <Link to="/shop">Collections</Link>
            <Link to="/shop">Sale</Link>
          </div>

          {/* Col 2: Help */}
          <div className="footer-col">
            <h4>Help</h4>
            <Link to="/contact">Contact</Link>
            <Link to="/Shipping">Shipping</Link>
            <Link to="/ReturnPolicy">Returns</Link>
            <Link to="/FaqPage">FAQs</Link>
          </div>

          {/* Col 3: Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/contact">About</Link>
            <Link to="/contact">Journal</Link>
            <Link to="/contact">Careers</Link>
          </div>

          {/* Col 4: Social */}
          <div className="footer-col">
            <h4>Social</h4>
            <a href="https://www.instagram.com/tererang.official/" target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
              Pinterest ↗
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              Facebook ↗
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>© 2026 Tere Rang. All rights reserved.</span>
          <div style={{ display: "flex", gap: "22px" }}>
            <Link to="/privacy-policy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
            <Link to="/TermsPage" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
            <Link to="/Shipping" style={{ color: "inherit", textDecoration: "none" }}>Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = ({ variant } = {}) => {
  return <HomeFooter />;
};

export default Footer;
