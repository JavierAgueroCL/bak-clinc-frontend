'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProfileCard } from './auth/ProfileCard';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';
import { ResetPasswordForm } from './auth/ResetPasswordForm';
import { VerifyEmailForm } from './auth/VerifyEmailForm';
import { Sidebar } from './Sidebar';

type ViewType = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'profile';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [resetToken, setResetToken] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar siempre visible */}
        <Sidebar />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col ml-64">
          <nav className="bg-white shadow-sm border-b">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    BAK Clinic
                  </h1>
                </div>
                <div className="flex items-center space-x-4 relative">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                  >
                    Bienvenido, {user.first_name}
                  </button>
                  
                  {/* Tooltip con ProfileCard */}
                  {isSidebarOpen && (
                    <div className="absolute top-full right-0 mt-2 z-50">
                      <div className="bg-white rounded-lg shadow-lg border p-1" style={{minWidth: '448px'}}>
                        <ProfileCard />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setCurrentView('verify-email')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Verificar Email
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 p-6">
            {currentView === 'verify-email' ? (
              <VerifyEmailForm
                onSuccess={() => setCurrentView('profile')}
                onBack={() => setCurrentView('profile')}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Bienvenido al Sistema BAK Clinic
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Selecciona una opción del menú lateral para comenzar
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  const renderAuthView = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterForm
            onSuccess={() => setCurrentView('profile')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={(token) => {
              setResetToken(token);
              setCurrentView('reset-password');
            }}
            onBack={() => setCurrentView('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={() => setCurrentView('login')}
            onBack={() => setCurrentView('login')}
          />
        );
      case 'verify-email':
        return (
          <VerifyEmailForm
            onSuccess={() => setCurrentView('login')}
            onBack={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <LoginForm
            onSuccess={() => setCurrentView('profile')}
            onSwitchToRegister={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                BAK Clinic
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('login')}
                className={`text-sm font-medium ${
                  currentView === 'login' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className={`text-sm font-medium ${
                  currentView === 'register' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Registro
              </button>
              <button
                onClick={() => setCurrentView('verify-email')}
                className={`text-sm font-medium ${
                  currentView === 'verify-email' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Verificar Email
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderAuthView()}
        </div>
      </main>
    </div>
  );
};