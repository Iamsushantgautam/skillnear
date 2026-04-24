import React from 'react';
import { Bell } from 'lucide-react';

const NotificationMenu = ({ 
    show, 
    setShow, 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    user, 
    navigate,
    notificationRef
}) => {
    return (
        <div style={{ position: 'relative' }} ref={notificationRef}>
            <button 
                onClick={() => {
                    setShow(!show);
                    if (!show && unreadCount > 0) markAllAsRead(user.token);
                }}
                className="bell-btn"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div className="animate-fade-in notif-dropdown">
                    <div className="notif-header">
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Notifications</h4>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notifications.length} total</span>
                    </div>
                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif._id} 
                                    onClick={() => {
                                        if (notif.link) navigate(notif.link);
                                        setShow(false);
                                    }}
                                    className={`notif-item ${!notif.isRead ? 'notif-item-unread' : ''}`}
                                >
                                    <div className="notif-item-title">{notif.title}</div>
                                    <div className="notif-item-message">{notif.message}</div>
                                    <div className="notif-item-time">{new Date(notif.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <button 
                            onClick={() => markAllAsRead(user.token)}
                            className="notif-footer-btn"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};



export default NotificationMenu;
