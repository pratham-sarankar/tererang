import React from 'react';
import { Package, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';
import '../css/Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) {
    const menuItems = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleMenuClick = (id) => {
        setActiveTab(id);
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Package size={28} />
                        <span>TereRang</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={onLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
