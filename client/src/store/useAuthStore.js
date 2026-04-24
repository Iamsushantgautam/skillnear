import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

/**
 * useAuthStore
 * Manages user authentication state and location settings.
 * Uses Zustand persist middleware to automatically sync state with localStorage.
 */
const useAuthStore = create(
    persist(
        (set) => ({
            // Initial State
            user: null,
            userLocation: { state: '', city: 'All of India' },
            loading: false,
            error: null,

            // Actions
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/api/auth/login', { email, password });
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
                set({ user: null });
            },

            setLocation: (locationData) => {
                set({ userLocation: locationData });
            },

            updateUserInfo: (userData) => {
                set({ user: userData });
            },

            toggleFavorite: async (serviceId) => {
                const { user } = useAuthStore.getState();
                if (!user) return false;
                try {
                    const { data } = await api.post(`/api/users/favorites/${serviceId}`);
                    const updatedUser = { ...user, favorites: data.favorites };
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
        }),
        {
            name: 'skillnear-auth-storage', // The key used in localStorage
        }
    )
);

export default useAuthStore;
