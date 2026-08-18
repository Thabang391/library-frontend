import React, { createContext, useContext, useState, type ReactNode } from 'react';
import API from '@/api';

interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { username?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const register = async (email: string, password: string, username: string) => {
    const res = await API.post('/auth/register', { email, password, username });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (data: { username?: string; avatarUrl?: string }) => {
    const res = await API.patch('/auth/me', data);
    setUser(res.data);
  };

  // On mount, check for token and fetch user
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          delete API.defaults.headers.common['Authorization'];
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};