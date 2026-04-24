import React from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ user, getAvatar }) => {
    return (
        <Link to="/dashboard" className="user-profile-link hide-on-mobile">
            <img 
                src={getAvatar(user)} 
                alt="Profile" 
                className="nav-avatar" 
                onError={(e) => { 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; 
                }} 
            />
            <span className="nav-username hide-on-mobile">{user.name}</span>
        </Link>
    );
};

export default UserMenu;
