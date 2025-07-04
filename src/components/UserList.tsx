'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authApi, ApiError } from '@/services/api';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        try {
          // Intentar obtener usuarios de la API con paginación
          const response = await authApi.getUsers({ page: 1, limit: 50 });
          setUsers(response.users);
        } catch (apiError) {
          // Si falla la API, usar datos mock
          console.warn('API falló, usando datos mock:', apiError);
          
          // Mostrar el mensaje específico del error si está disponible
          if (apiError instanceof ApiError) {
            console.warn('Error específico del backend:', apiError.message);
          }
          const mockUsers: User[] = [
            {
              id: 1,
              email: 'admin@clinic.com',
              first_name: 'Admin',
              last_name: 'Sistema',
              phone: '+1234567890',
              role: 'admin',
              is_active: true,
              email_verified: true,
              created_at: '2025-01-01T00:00:00.000Z',
              updated_at: '2025-01-01T00:00:00.000Z',
            },
            {
              id: 2,
              email: 'doctor@clinic.com',
              first_name: 'Dr. Juan',
              last_name: 'Pérez',
              phone: '+1234567891',
              role: 'doctor',
              is_active: true,
              email_verified: true,
              created_at: '2025-01-02T00:00:00.000Z',
              updated_at: '2025-01-02T00:00:00.000Z',
            },
            {
              id: 3,
              email: 'patient@clinic.com',
              first_name: 'María',
              last_name: 'González',
              phone: '+1234567892',
              role: 'patient',
              is_active: true,
              email_verified: false,
              created_at: '2025-01-03T00:00:00.000Z',
              updated_at: '2025-01-03T00:00:00.000Z',
            },
          ];
          
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 500));
          setUsers(mockUsers);
        }
      } catch {
        setError('Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Usuarios</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Usuarios</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Usuarios</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  {user.first_name?.charAt(0)?.toUpperCase() || '?'}
                  {user.last_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleName(user.role)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>ID: {user.id}</span>
                  <span>{user.email_verified ? '✓ Verificado' : '⚠ Pendiente'}</span>
                  <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};