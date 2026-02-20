import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MessageSquare, User } from 'lucide-react';

const MobileNav = () => {
    return (
        <nav className="mobile-nav show-on-mobile">
            <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={24} />
                <span>Services</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <MessageSquare size={24} />
                <span>Messages</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default MobileNav;
