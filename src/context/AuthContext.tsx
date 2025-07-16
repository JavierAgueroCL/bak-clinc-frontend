'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, User } from '@/types/auth';
import { TokenValidator } from '@/utils/tokenValidator';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    router.push('/');
  }, [router]);

  const validateToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (state.isAuthenticated) {
        logout();
      }
      return false;
    }

    try {
      const validation = await TokenValidator.validateToken(token);
      
      if (!validation.isValid) {
        console.warn('Token inválido detectado:', validation.error);
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar token:', error);
      logout();
      return false;
    }
  }, [state.isAuthenticated, logout]);

  useEffect(() => {
    setIsHydrated(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && state.token && isHydrated) {
      const performValidation = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          logout();
          return;
        }

        try {
          const validation = await TokenValidator.validateToken(token);
          
          if (!validation.isValid) {
            console.warn('Token inválido detectado:', validation.error);
            logout();
            return;
          }

          // Iniciar validación periódica solo si el token es válido
          if (validationIntervalRef.current) {
            clearInterval(validationIntervalRef.current);
          }
          
          validationIntervalRef.current = setInterval(async () => {
            await validateToken();
          }, 60000);
        } catch (error) {
          console.error('Error al validar token:', error);
          logout();
        }
      };
      
      performValidation();
    }
    
    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
    };
  }, [state.isAuthenticated, state.token, isHydrated, logout, validateToken]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
    }));
  };


  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    validateToken,
  };

  if (!isHydrated) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
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