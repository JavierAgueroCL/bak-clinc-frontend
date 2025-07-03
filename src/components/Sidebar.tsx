'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleUserListClick = () => {
    router.push('/users');
  };

  const handleDashboardClick = () => {
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 h-full bg-white shadow-lg border-r w-64 z-40">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
      </div>
      
      <div className="flex flex-col h-full">
        <nav className="p-4 border-b">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={handleDashboardClick}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${
                  pathname === '/' ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span className="text-gray-800">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handleUserListClick}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${
                  pathname === '/users' ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span className="text-gray-800">Lista de Usuarios</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};