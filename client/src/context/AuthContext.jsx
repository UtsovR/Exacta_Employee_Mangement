import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_OFFICE_CONFIG } from '@/constants/config';

const AuthContext = createContext(null);

const cloneDefaultOfficeConfig = () =>
    JSON.parse(JSON.stringify(DEFAULT_OFFICE_CONFIG));

const normalizeRole = (role) => {
    if (!role || typeof role !== 'string') {
        return 'EMPLOYEE';
    }

    const normalized = role.trim().toUpperCase();
    return normalized || 'EMPLOYEE';
};

const buildUserFromAuth = (authUser, profile = null) => {
    const metadata = authUser?.user_metadata || {};
    const email = authUser?.email || profile?.email || null;
    const resolvedRole = normalizeRole(profile?.role || metadata.role);

    return {
        ...profile,
        id: authUser?.id || profile?.id || null,
        email,
        name: profile?.name || metadata.name || email || 'User',
        role: resolvedRole,
        team: profile?.team || metadata.team || null,
        empId:
            profile?.emp_id ||
            profile?.empId ||
            metadata.empId ||
            metadata.employeeId ||
            authUser?.id ||
            null,
        profilePhoto:
            profile?.profilePhoto ||
            profile?.profile_photo ||
            metadata.profilePhoto ||
            metadata.profile_photo ||
            null,
        joiningDate: profile?.joiningDate || profile?.joining_date || null,
        dob: profile?.dob || null,
        bloodGroup: profile?.bloodGroup || profile?.blood_group || null,
    };
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [officeConfig, setOfficeConfig] = useState(cloneDefaultOfficeConfig());
    const [loading, setLoading] = useState(true);

    const token = session?.access_token || null;
    const isAuthenticated = !!session;

    const hydrateUser = useCallback(async (nextSession) => {
        const authUser = nextSession?.user;
        if (!authUser) {
            return null;
        }

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            if (error) {
                console.error('Failed to load profile from Supabase:', error);
                return buildUserFromAuth(authUser);
            }

            return buildUserFromAuth(authUser, profile);
        } catch (error) {
            console.error('Failed to load profile from Supabase:', error);
            return buildUserFromAuth(authUser);
        }
    }, []);

    const refreshSettings = useCallback(
        async (tokenOverride) => {
            const activeToken = tokenOverride || session?.access_token;
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
        },
        [session]
    );

    const syncSessionState = useCallback(
        async (nextSession) => {
            setSession(nextSession || null);

            if (!nextSession) {
                setUser(null);
                setOfficeConfig(cloneDefaultOfficeConfig());
                return;
            }

            const nextUser = await hydrateUser(nextSession);
            setUser(nextUser);
        },
        [hydrateUser]
    );

    useEffect(() => {
        let isActive = true;

        const initializeAuth = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Failed to read Supabase session:', error);
                }

                if (!isActive) {
                    return;
                }

                await syncSessionState(data?.session || null);
            } catch (error) {
                console.error('Error initializing auth state:', error);
                if (isActive) {
                    setSession(null);
                    setUser(null);
                    setOfficeConfig(cloneDefaultOfficeConfig());
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!isActive) {
                return;
            }

            syncSessionState(nextSession).catch((error) => {
                console.error('Error syncing auth state:', error);
            });
        });

        return () => {
            isActive = false;
            data.subscription.unsubscribe();
        };
    }, [syncSessionState]);

    useEffect(() => {
        if (token) {
            refreshSettings(token);
        } else {
            setOfficeConfig(cloneDefaultOfficeConfig());
        }
    }, [token, refreshSettings]);

    const login = useCallback(
        async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                throw new Error(error.message || 'Unable to login. Please try again.');
            }

            const nextSession = data?.session;
            if (!nextSession?.user) {
                throw new Error('Login succeeded but no active session was returned.');
            }

            const nextUser = await hydrateUser(nextSession);
            setSession(nextSession);
            setUser(nextUser);
            await refreshSettings(nextSession.access_token);

            return nextUser;
        },
        [hydrateUser, refreshSettings]
    );

    const refreshUser = useCallback(async () => {
        if (!session) {
            return null;
        }

        const refreshedUser = await hydrateUser(session);
        setUser(refreshedUser);
        return refreshedUser;
    }, [hydrateUser, session]);

    const logout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Failed to logout from Supabase:', error);
        }

        setSession(null);
        setUser(null);
        setOfficeConfig(cloneDefaultOfficeConfig());
    }, []);

    const value = {
        user,
        session,
        token,
        officeConfig,
        isAuthenticated,
        login,
        logout,
        loading,
        refreshUser,
        refreshSettings,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
