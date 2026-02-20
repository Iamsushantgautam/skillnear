import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('adminInfo')) || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/login', { email, password });

            if (data.role !== 'admin') {
                set({ error: 'Not authorized as admin', loading: false });
                return false;
            }

            localStorage.setItem('adminInfo', JSON.stringify(data));
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
        localStorage.removeItem('adminInfo');
        set({ user: null });
    },
}));

export default useAuthStore;
