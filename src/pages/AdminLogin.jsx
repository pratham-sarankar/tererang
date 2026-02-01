import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminLogin.css';
import { apiUrl } from '../config/env.js';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(apiUrl('/api/admin/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                // Store admin token
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-icon">
                        <Lock size={32} />
                    </div>
                    <h1 className="admin-login-title">Admin Panel</h1>
                    <p className="admin-login-subtitle">Sign in to manage your store</p>
                </div>
                
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-group">
                        <label htmlFor="username" className="admin-form-label">
                            Username
                        </label>
                        <div className="admin-input-wrapper">
                            <User className="admin-input-icon" size={18} />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="password" className="admin-form-label">
                            Password
                        </label>
                        <div className="admin-input-wrapper">
                            <Lock className="admin-input-icon" size={18} />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="admin-error-message">
                            <AlertCircle size={18} className="admin-error-icon" />
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="admin-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}