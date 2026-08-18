import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import API from './api';

// 1. Define the User Type
export interface User {
  id: number | string;
  email: string;
  // Add any other fields your backend returns (e.g., name, role)
  [key: string]: any; 
}

// 2. Define the Context Type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, check if a token exists and fetch current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    API.get('/auth/me')
      .then((res) => {
        setUser(res.data as User);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setUser(user as User);
    return user as User;
  };

  const register = async (email: string, password: string): Promise<any> => {
    const res = await API.post('/auth/register', { email, password });
    // The backend currently returns user data without token; you may optionally log in here
    return res.data;
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the Auth Context safely
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}