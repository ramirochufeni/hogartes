import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { getToken, setToken, removeToken } from '../lib/authHelpers';

export type Role = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
  upgradeAccount: () => Promise<void>; // Retained for compatibility if needed internally
  onboardProvider: (data: any) => Promise<void>;
  adminLogin: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Intentar cargar usuario desde token en localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const { data } = await fetchApi('/auth/me');
          setUser(data.user);
        } catch (error) {
          console.error("Token inválido o expirado", error);
          removeToken();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await fetchApi('/auth/login', {
      method: 'POST',
      data: credentials,
    });
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential: string) => {
    const { data } = await fetchApi('/auth/google', {
      method: 'POST',
      data: { credential },
    });
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (userData: any) => {
    // Only registers, doesn't auto login because of missing isEmailVerified
    await fetchApi('/auth/register', {
      method: 'POST',
      data: userData,
    });
  };

  const resendVerification = async (email: string) => {
    await fetchApi('/auth/resend-verification', {
      method: 'POST',
      data: { email },
    });
  };

  const requestPasswordReset = async (email: string) => {
    await fetchApi('/auth/request-reset', {
      method: 'POST',
      data: { email },
    });
  };

  const verifyEmail = async (token: string) => {
    await fetchApi('/auth/verify-email', {
      method: 'POST',
      data: { token },
    });
  };

  const resetPassword = async (data: any) => {
    await fetchApi('/auth/reset-password', {
      method: 'POST',
      data,
    });
  };

  const upgradeAccount = async () => {
    const { data } = await fetchApi('/auth/upgrade-provider', {
      method: 'POST',
    });
    setToken(data.token);
    setUser(data.user);
  };

  const onboardProvider = async (formData: any) => {
    const { data } = await fetchApi('/provider/profile', {
      method: 'POST',
      data: formData,
    });

    // Guardar nuevo token (ROL PROVIDER)
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const adminLogin = async (credentials: any) => {
    const { data } = await fetchApi('/auth/admin-login', {
      method: 'POST',
      data: credentials,
    });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      resendVerification,
      requestPasswordReset,
      verifyEmail,
      resetPassword,
      upgradeAccount,
      onboardProvider,
      adminLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
