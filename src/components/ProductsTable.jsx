import React, { useState } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/ProductsTable.css';

const ITEMS_PER_PAGE = 10;

export default function ProductsTable({ products, onEdit, onDelete, imageUrl }) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    const getTotalStock = (sizeStock) => {
        if (!sizeStock || !Array.isArray(sizeStock)) return 0;
        return sizeStock.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    };

    return (
        <div className="products-table-container">
            <div className="table-wrapper">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No products found
                                </td>
                            </tr>
                        ) : (
                            currentProducts.map((product) => {
                                const totalStock = getTotalStock(product.sizeStock);
                                return (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="product-image-cell">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={imageUrl(product.images[0])}
                                                        alt={product.name}
                                                        className="product-thumbnail"
                                                    />
                                                ) : (
                                                    <div className="product-thumbnail-placeholder">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="product-name-cell">
                                                {product.name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="price-cell">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="stock-cell">
                                            {totalStock > 0 ? totalStock : '-'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => onEdit(product)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => onDelete(product._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
