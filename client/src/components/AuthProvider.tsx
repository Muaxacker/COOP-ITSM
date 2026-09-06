import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { User } from '../types';
import * as AuthService from '../services/auth.service';
import toast from 'react-hot-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('coop_itsm_token') || localStorage.getItem('bankcare_token');
    const savedUser = localStorage.getItem('coop_itsm_user') || localStorage.getItem('bankcare_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('coop_itsm_token');
        localStorage.removeItem('coop_itsm_user');
        localStorage.removeItem('bankcare_token');
        localStorage.removeItem('bankcare_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    localStorage.setItem('coop_itsm_token', data.token);
    localStorage.setItem('coop_itsm_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('coop_itsm_token');
    localStorage.removeItem('coop_itsm_user');
    localStorage.removeItem('bankcare_token');
    localStorage.removeItem('bankcare_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('coop_itsm_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
