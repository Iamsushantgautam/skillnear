import { create } from 'zustand';
import api from '../utils/api';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async (token) => {
        if (!token) return;
        set({ loading: true });
        try {
            const res = await api.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ 
                notifications: res.data.slice(0, 7), 
                unreadCount: res.data.filter(n => !n.isRead).length,
                loading: false 
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ loading: false });
        }
    },

    addNotification: (notification) => {
        set((state) => {
            const newNotifications = [notification, ...state.notifications].slice(0, 7);
            return {
                notifications: newNotifications,
                unreadCount: newNotifications.filter(n => !n.isRead).length
            };
        });
    },

    markAllAsRead: async (token) => {
        if (!token) return;
        try {
            await api.put('/api/notifications/mark-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    },

    clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));

export default useNotificationStore;
