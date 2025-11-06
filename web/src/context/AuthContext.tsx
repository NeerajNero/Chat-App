// web/src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import { User } from '../types';
import { usePathname } from 'next/navigation';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // 2. Get the current page path

  useEffect(() => {
    // This is the key: On app load, we call our backend's
    // /auth/profile route.
    // Because of our axios config, the cookie is sent automatically.
    // If it succeeds, we're logged in. If it fails (401), we're not.
    const checkUserStatus = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        if (pathname === '/login' || pathname === '/signup') {
          router.push('/'); // Redirect to homepage
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router, pathname]); // 3. Add pathname as a dependency

  // Function to update state on login
  const login = (data: User) => {
    setUser(data);
    router.push('/dashboard'); // Or '/chat'
  };

  // Function to call the logout endpoint
  const logout = async () => {
    try {
      await api.post('/auth/logout'); // Tell backend to clear the cookie
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};