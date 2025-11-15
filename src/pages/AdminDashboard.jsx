import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminDashboard.css';

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'kurti',
        inStock: true,
        image: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchProducts();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/products');
            const data = await response.json();
            
            if (response.ok) {
                setProducts(data.products);
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('price', formData.price);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('inStock', formData.inStock);
        
        if (formData.image) {
            submitData.append('image', formData.image);
        }

        try {
            const url = editingProduct 
                ? `http://localhost:3001/api/products/${editingProduct._id}`
                : 'http://localhost:3001/api/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const data = await response.json();

            if (response.ok) {
                fetchProducts(); // Refresh products list
                resetForm();
                setError('');
            } else {
                setError(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError('Network error. Please try again.');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            category: product.category,
            inStock: product.inStock,
            image: null
        });
        setShowAddForm(true);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        const token = localStorage.getItem('adminToken');

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchProducts(); // Refresh products list
                setError('');
            } else {
                const data = await response.json();
                setError(data.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            setError('Network error. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category: 'kurti',
            inStock: true,
            image: null
        });
        setEditingProduct(null);
        setShowAddForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <button 
                        className="add-btn"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Cancel' : 'Add Product'}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="product-form">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Product Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="kurti">Kurti</option>
                                    <option value="suit">Suit</option>
                                    <option value="skirt">Skirt</option>
                                    <option value="coat">Coat</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="inStock"
                                        checked={formData.inStock}
                                        onChange={handleInputChange}
                                    />
                                    In Stock
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Product Image</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleInputChange}
                                accept="image/*"
                                required={!editingProduct}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="products-section">
                <h2>Products ({products.length})</h2>
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <img 
                                src={`http://localhost:3001/uploads/${product.image}`} 
                                alt={product.name}
                                className="product-image"
                            />
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-price">₹{product.price}</p>
                                <p className="product-category">{product.category}</p>
                                <p className={`product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </p>
                                {product.description && (
                                    <p className="product-description">{product.description}</p>
                                )}
                                <div className="product-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="no-products">
                        <p>No products found. Add some products to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}