import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { DEFAULT_OFFICE_CONFIG } from '@/constants/config';

const AuthContext = createContext(null);

const cloneDefaultOfficeConfig = () =>
    JSON.parse(JSON.stringify(DEFAULT_OFFICE_CONFIG));

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [officeConfig, setOfficeConfig] = useState(cloneDefaultOfficeConfig());
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    const refreshSettings = useCallback(async (tokenOverride) => {
        const activeToken = tokenOverride || localStorage.getItem('token');
        if (!activeToken) {
            setOfficeConfig(cloneDefaultOfficeConfig());
            return;
        }

        try {
            const data = await apiRequest('/api/settings', { token: activeToken });
            if (data?.OFFICE_CONFIG) {
                setOfficeConfig(data.OFFICE_CONFIG);
            } else {
                setOfficeConfig(cloneDefaultOfficeConfig());
            }
        } catch (error) {
            console.error('Failed to refresh office config:', error);
            setOfficeConfig(cloneDefaultOfficeConfig());
        }
    }, []);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Error restoring auth state:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            refreshSettings(token);
        } else {
            setOfficeConfig(cloneDefaultOfficeConfig());
        }
    }, [token, refreshSettings]);

    const login = useCallback(
        async (empId, password) => {
            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: { empId, password },
            });

            if (!data?.token || !data?.user) {
                throw new Error('Login response is missing required fields');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setToken(data.token);
            await refreshSettings(data.token);

            return data.user;
        },
        [refreshSettings]
    );

    const refreshUser = useCallback(async () => {
        const activeToken = localStorage.getItem('token');
        if (!activeToken) {
            return null;
        }

        try {
            const updatedUser = await apiRequest('/api/auth/me', { token: activeToken });
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setOfficeConfig(cloneDefaultOfficeConfig());
    }, []);

    const value = {
        user,
        token,
        officeConfig,
        isAuthenticated,
        login,
        logout,
        loading,
        refreshUser,
        refreshSettings,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
