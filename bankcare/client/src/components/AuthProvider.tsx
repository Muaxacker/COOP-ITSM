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
    const savedToken = localStorage.getItem('bankcare_token');
    const savedUser = localStorage.getItem('bankcare_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bankcare_token');
        localStorage.removeItem('bankcare_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    localStorage.setItem('bankcare_token', data.token);
    localStorage.setItem('bankcare_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bankcare_token');
    localStorage.removeItem('bankcare_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
