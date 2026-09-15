import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";
import SplitBanner from "../components/SplitBanner.jsx";
import StorefrontProductCard from "../components/StorefrontProductCard.jsx";
import HomeCarousel from "../components/HomeCarousel.jsx";
import { collections } from "../components/storefrontData.js";
import tailoringImage from "../assets/traditional_ethnic_wear.png";
import "../css/Home.css";

const LATEST_COLLECTION_LIMIT = 12;

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const latestProductsEndpoint = useMemo(
    () => apiUrl(`/api/products?limit=${LATEST_COLLECTION_LIMIT}&page=${currentPage}`),
    [currentPage]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const response = await fetch(latestProductsEndpoint);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Failed to load latest collection. Please try again.");
        }
        if (isMounted) {
          const products = Array.isArray(data) ? data : data?.products || [];
          const pagination = data?.pagination;

          setLatestProducts((previous) => (currentPage === 1 ? products : [...previous, ...products.filter((product) => !previous.some((item) => (item._id || item.id) === (product._id || product.id)))]));
          setHasMore(pagination ? pagination.current < pagination.pages : products.length >= LATEST_COLLECTION_LIMIT);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to fetch products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [latestProductsEndpoint, reloadFlag, currentPage]);

  const enrichedProducts = useMemo(
    () => latestProducts.map((product) => mapProductForDisplay(product)),
    [latestProducts]
  );

  const handleReload = () => {
    setCurrentPage(1);
    setHasMore(true);
    setReloadFlag((flag) => flag + 1);
  };

  const handleSelectProduct = (product) => {
    const targetId = product?.backendId || product?.id;
    if (!targetId) return;
    navigate(`/product/${targetId}`, { state: { product } });
  };

  return (
    <main className="home-page">
      <SplitBanner />
      <section className="home-section home-collections" aria-labelledby="collections-title">
        <div className="home-container">
          <div className="home-section-heading">
            <div><p className="home-eyebrow">The collection edit</p><h2 id="collections-title">A wardrobe, <em>considered.</em></h2></div>
            <Link className="home-text-link" to="/shop">Shop all collections <ArrowRight size={15} /></Link>
          </div>
          <HomeCarousel label="Collections">
            {collections.map((collection) => (
              <Link className="home-collection-card" key={collection.to} to={collection.to}>
                <img src={collection.img} alt={collection.title} loading="lazy" />
                <div className="home-collection-copy">
                  <p className="home-eyebrow">{collection.eyebrow}</p>
                  <h3>{collection.title}</h3><span>Explore collection</span>
                </div>
              </Link>
            ))}
          </HomeCarousel>
        </div>
      </section>
      <section id="latest-collection" className="home-section home-bestsellers" aria-labelledby="bestsellers-title">
        <div className="home-container">
          <div className="home-section-heading">
            <div><p className="home-eyebrow">Discover Tererang</p><h2 id="bestsellers-title">Pieces to <em>treasure.</em></h2></div>
            <Link className="home-text-link" to="/shop">Explore the edit <ArrowRight size={15} /></Link>
          </div>
          {loading && !enrichedProducts.length && !error ? <div className="home-skeletons" role="status" aria-label="Loading products">{Array.from({length:4}, (_, i) => <div className="home-skeleton" key={i} />)}</div> : null}
          {!loading && !error && !enrichedProducts.length ? <div className="home-status"><h3>No products available yet</h3><p>Check back soon for our latest collection.</p></div> : null}
          {enrichedProducts.length > 0 ? <HomeCarousel label="Bestsellers">
            {enrichedProducts.map((product) => <StorefrontProductCard key={product.id} product={product} onSelect={handleSelectProduct} variant="home" />)}
            {hasMore ? <div className="home-load-more"><p className="home-eyebrow">More to discover</p><h3>Find your next<br /><em>favorite.</em></h3><button className="home-button home-button-outline" disabled={loadingMore || loading} onClick={() => error ? setReloadFlag(flag => flag + 1) : setCurrentPage(page => page + 1)}>{loadingMore || loading ? "Loading…" : error ? "Try again" : "Load more pieces"}<ArrowRight size={15} /></button></div> : null}
          </HomeCarousel> : null}
          {error ? <div className="home-status" role="alert"><RefreshCw size={24} /><h3>Unable to load {enrichedProducts.length ? "more pieces" : "collection"}</h3><p>{error}</p><button className="home-button home-button-outline" onClick={enrichedProducts.length ? () => setReloadFlag(flag => flag + 1) : handleReload}>Try again</button></div> : null}
        </div>
      </section>
      <section className="home-tailoring" aria-labelledby="tailoring-title">
        <div className="home-container home-tailoring-grid">
          <img className="home-tailoring-image" src={tailoringImage} alt="Tererang traditional silhouettes and embroidery" loading="lazy" />
          <div className="home-tailoring-copy"><p className="home-eyebrow">Bespoke services</p>
            <h2 id="tailoring-title">Made personal.<br /><em>Made for you.</em></h2><div className="home-rose-rule" />
            <p className="home-tailoring-description">Tererang pieces are shaped around your rhythm: complimentary size guidance, length adjustments, and direct designer consultation for outfits that fit beautifully.</p>
            <div className="home-actions"><a className="home-button" href="https://wa.me/919548971147" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Chat with designer</a><Link className="home-button home-button-outline" to="/shop">Explore catalog</Link></div>
          </div>
        </div>
      </section>
      <Footer variant="home" />
    </main>
  );
};
export default Home;
