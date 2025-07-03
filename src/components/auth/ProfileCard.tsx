'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const ProfileCard: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'patient':
        return 'Paciente';
      case 'doctor':
        return 'Doctor';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'doctor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-600">
            {user.first_name?.charAt(0).toUpperCase() || '?'}{user.last_name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {user.first_name || 'Sin nombre'} {user.last_name || 'Sin apellido'}
        </h2>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
          {getRoleName(user.role)}
        </span>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Email</h3>
          <p className="text-gray-800">{user.email}</p>
          <div className="mt-1">
            {user.email_verified ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pendiente verificación
              </span>
            )}
          </div>
        </div>

        {user.phone && (
          <div className="border-b pb-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Teléfono</h3>
            <p className="text-gray-800">{user.phone}</p>
          </div>
        )}

        <div className="border-b pb-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Fecha de registro</h3>
          <p className="text-gray-800">
            {new Date(user.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};