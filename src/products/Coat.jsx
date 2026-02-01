import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";

const CategoryProductCard = ({ product, onSelect }) => (
	<div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group relative">
		{/* Discount Badge */}
		{product.discount > 0 && (
			<div className="absolute top-4 left-4 z-10 bg-[#b81582] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
				{product.discount}% OFF
			</div>
		)}

		<div className="relative overflow-hidden" onClick={() => onSelect(product)}>
			<img
				src={product.image}
				alt={product.title}
				className="w-full h-80 object-cover transition duration-700 group-hover:scale-105"
				loading="lazy"
			/>

			{/* Overlay with Centered Action */}
			<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
				<div className="bg-white/90 backdrop-blur-sm text-[#b81582] px-6 py-2.5 rounded-full font-bold shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
					Quick View
				</div>
			</div>
		</div>

		<div className="p-5">
			<div className="mb-2">
				<p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1 group-hover:text-[#b81582] transition-colors">
					{product.brand}
				</p>
				<h3 className="text-lg font-bold text-gray-900 truncate leading-tight mb-1">
					{product.title}
				</h3>
				{product.description && (
					<p className="text-xs text-gray-500 line-clamp-2 h-8 leading-snug mb-3 opacity-80">
						{product.description}
					</p>
				)}
			</div>

			<div className="flex items-end justify-between mt-2">
				<div className="flex flex-col">
					{product.displayOldPrice && (
						<span className="line-through text-gray-400 text-xs mb-0.5">
							{product.displayOldPrice}
						</span>
					)}
					<span className="text-xl font-extrabold text-[#b81582]">
						{product.displayPrice}
					</span>
				</div>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onSelect(product);
					}}
					className="bg-gray-100 text-[#b81582] p-2.5 rounded-full hover:bg-[#b81582] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
					aria-label={`Add ${product.title} to cart`}
					type="button"
				>
					<ShoppingCart className="w-5 h-5" />
				</button>
			</div>
		</div>
	</div>
);

const Coat = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [reloadFlag, setReloadFlag] = useState(0);
	const navigate = useNavigate();

	const endpoint = useMemo(() => apiUrl("/api/products?category=coat"), []);

	useEffect(() => {
		let isMounted = true;
		const fetchProducts = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(endpoint);
				const payload = await res.json();
				if (!res.ok) {
					throw new Error(payload.message || "Failed to fetch coat collection");
				}
				if (isMounted) {
					const items = Array.isArray(payload) ? payload : payload.products || [];
					setProducts(items);
				}
			} catch (err) {
				if (isMounted) {
					setError(err.message || "Unable to load products");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchProducts();
		return () => {
			isMounted = false;
		};
	}, [endpoint, reloadFlag]);

	const formattedProducts = useMemo(
		() => products.map((item) => mapProductForDisplay({ ...item, category: item.category || "Coat" })),
		[products]
	);

	const handleSelectProduct = (product) => {
		if (!product?.id) return;
		navigate(`/product/${product.id}`, { state: { product } });
	};

	const handleReload = () => setReloadFlag((flag) => flag + 1);

	return (
		<>
			<div className="min-h-screen bg-white text-gray-900">
				<section className="py-16 bg-gradient-to-b from-pink-50/50 to-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
							<div>
								<div className="inline-flex items-center bg-pink-100/50 rounded-full px-3 py-1 mb-2 border border-pink-100">
									<Sparkles className="w-3.5 h-3.5 text-[#b81582] mr-1.5" />
									<span className="text-[#b81582] uppercase tracking-wider text-xs font-bold">
										Winter Luxe
									</span>
								</div>
								<h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
									Coat Collection
								</h3>
								<p className="text-gray-600 text-base">
									Tailored layers, elevated fabrics, and dramatic drapes for the season.
								</p>
							</div>
							<button
								type="button"
								className="flex items-center border-2 border-pink-100 px-4 py-2 rounded-full text-[#b81582] hover:bg-[#b81582] hover:text-white hover:border-[#b81582] transition-colors duration-300 font-semibold text-sm"
								onClick={handleReload}
							>
								<svg
									className="w-4 h-4 mr-1.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Refresh
							</button>
						</div>

						{loading && !error && (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
								{Array.from({ length: 8 }, (_, index) => index + 1).map(
									(item) => (
										<div
											key={`skeleton-${item}`}
											className="bg-white rounded-2xl shadow-lg p-6 h-96"
										/>
									)
								)}
							</div>
						)}

						{error && (
							<div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-red-100">
								<div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-3">
									<svg
										className="w-7 h-7 text-red-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-bold text-red-600 mb-2">
									Unable to load collection
								</h3>
								<p className="text-gray-600 mb-4 text-sm">{error}</p>
								<button
									type="button"
									className="px-6 py-2 bg-[#b81582] text-white rounded-full font-semibold hover:bg-[#a01270] transition shadow-lg text-sm"
									onClick={handleReload}
								>
									Try Again
								</button>
							</div>
						)}

						{!error && !loading && formattedProducts.length === 0 && (
							<div className="text-center py-12">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
									<ShoppingCart className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									No products available yet
								</h3>
								<p className="text-gray-500 text-sm">
									Check back soon for our latest collection!
								</p>
							</div>
						)}

						{!error && formattedProducts.length > 0 && (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{formattedProducts.map((product) => (
									<CategoryProductCard
										key={product.id}
										product={product}
										onSelect={handleSelectProduct}
									/>
								))}
							</div>
						)}
					</div>
				</section>
			</div>
			<Footer></Footer>
		</>
	);
};

export default Coat;