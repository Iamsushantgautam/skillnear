import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor – auto-attach auth token if present in localStorage
api.interceptors.request.use(
    (config) => {
        try {
            const authStorage = localStorage.getItem('skillnear-auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                const token = state?.user?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error parsing auth storage', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle global errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token might be expired or invalid
            localStorage.removeItem('skillnear-auth-storage');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const API_URL = API_BASE_URL;
export default api;
