import { create } from 'zustand';
import api from '../utils/api';

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

    register: async (name, email, password, phone) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password, phone });
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

    clearError: () => set({ error: null })
}));

export default useAuthStore;
