import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get storage based on remember me preference
const getStorage = (rememberMe: boolean) => {
    return rememberMe ? localStorage : sessionStorage;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check localStorage first (for remembered users), then sessionStorage
        let storedToken = localStorage.getItem('token');
        let storedUser = localStorage.getItem('user');

        // If not in localStorage, check sessionStorage
        if (!storedToken) {
            storedToken = sessionStorage.getItem('token');
            storedUser = sessionStorage.getItem('user');
        }

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User, rememberMe: boolean = false) => {
        const storage = getStorage(rememberMe);

        // Clear the other storage
        if (rememberMe) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        storage.setItem('token', newToken);
        storage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        // Clear both storages
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // Keep remembered email if it exists (for remember me on email field)
        // localStorage.removeItem('rememberedEmail'); // Uncomment to also clear remembered email

        setToken(null);
        setUser(null);

        // Optional: Call backend logout
        // api.post('/auth/logout').catch(console.error);

        window.location.href = '/login';
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
