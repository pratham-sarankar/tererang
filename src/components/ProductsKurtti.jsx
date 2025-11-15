import React, { useState, useEffect } from 'react'
import Card from '../pages/Card'
import { apiUrl, imageUrl } from '../config/env.js'

export default function ProductsKurtti() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(apiUrl('/api/products?category=kurti'));
            const data = await response.json();
            
            if (response.ok) {
                // Transform the products to match the Card component's expected format
                const transformedProducts = data.products.map(product => ({
                    image: imageUrl((product.images && product.images[0]) ? product.images[0] : product.image),
                    name: product.name,
                    price: product.price,
                    id: product._id
                }));
                setProducts(transformedProducts);
            } else {
                setError('Failed to fetch products');
                // Fallback to empty array if fetch fails
                setProducts([]);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            setError('Network error. Please try again.');
            // Fallback to empty array if fetch fails
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div>
                <h2>Featured Products</h2>
                <div className="loading-message">Loading products...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Featured Products</h2>
                <div className="error-message">
                    {error}
                    <button onClick={fetchProducts} style={{ marginLeft: '10px' }}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Featured Products</h2>
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map((product, index) => (
                        <Card 
                            key={product.id || index} 
                            image={product.image} 
                            name={product.name} 
                            price={product.price} 
                        />
                    ))
                ) : (
                    <div className="no-products-message">
                        No products available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
