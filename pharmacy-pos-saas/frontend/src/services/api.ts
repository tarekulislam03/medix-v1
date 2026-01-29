import axios from 'axios';

// Helper to get token from either storage
const getToken = (): string | null => {
    // Check sessionStorage first as it's more specific to current session
    return sessionStorage.getItem('token') || localStorage.getItem('token');
};

// Helper to clear tokens from both storages
const clearTokens = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            // Prevent loop if we are already at login
            if (window.location.pathname.includes('/login')) {
                return Promise.reject(error);
            }

            // Handle unauthorized - redirect to login
            isRedirecting = true;
            clearTokens();

            // Use a small timeout to prevent immediate re-execution
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
        return Promise.reject(error);
    }
);

export default api;
