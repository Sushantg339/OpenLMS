'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored user / session state on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('openlms_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const userData: User = response.data.data;
    setUser(userData);
    localStorage.setItem('openlms_user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/signup', { name, email, password });
    const userData: User = response.data.data;
    setUser(userData);
    localStorage.setItem('openlms_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint warning:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('openlms_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
