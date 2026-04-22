import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('userInfo')) || null,
    userLocation: JSON.parse(localStorage.getItem('userLocation')) || { state: '', city: 'All of India' },
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            set({ user: data, loading: false });
            return true;
        } catch (error) {
            set({
                error: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
                loading: false,
            });
            return false;
        }
    },

    register: async (name, email, username, password, phone) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/register', { name, email, username, password, phone });
            localStorage.setItem('userInfo', JSON.stringify(data));
            set({ user: data, loading: false });
            return true;
        } catch (error) {
            set({
                error: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
                loading: false,
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('userInfo');
        set({ user: null });
    },

    setLocation: (locationData) => {
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        set({ userLocation: locationData });
    },

    updateUserInfo: (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        set({ user: userData });
    },

    toggleFavorite: async (serviceId) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        try {
            const { data } = await api.post(`/api/users/favorites/${serviceId}`);
            const updatedUser = { ...user, favorites: data.favorites };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            set({ user: updatedUser });
            toast.success(data.message);
            return true;
        } catch (error) {
            console.error("Toggle favorite error", error);
            toast.error(error.response?.data?.message || "Failed to update favorites");
            return false;
        }
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
