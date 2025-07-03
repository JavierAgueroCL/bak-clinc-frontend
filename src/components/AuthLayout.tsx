'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { ProfileCard } from './auth/ProfileCard';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title = 'BAK Clinic' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <nav className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {title}
                </h1>
              </div>
              <div className="flex items-center space-x-4 relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                  Bienvenido, {user.first_name}
                </button>
                
                {/* Tooltip con ProfileCard */}
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 z-50">
                    <div className="bg-white rounded-lg shadow-lg border p-1" style={{minWidth: '448px'}}>
                      <ProfileCard />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};