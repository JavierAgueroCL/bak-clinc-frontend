'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, isCollapsed, toggleSidebar } = useSidebar();

  const handleUserListClick = () => {
    router.push('/users');
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  const handleSurgerySchedulingClick = () => {
    router.push('/programar-cirugia');
  };

  const handlePatientsClick = () => {
    router.push('/pacientes');
  };

  return (
    <>
      {/* Collapsed Sidebar */}
      {isCollapsed && (
        <div className="fixed top-0 left-0 h-full bg-white shadow-lg border-r w-16 z-40 flex flex-col">
          <div className="flex items-center justify-center p-4 border-b">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Full Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r w-64 z-40 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      
      <div className="flex flex-col h-full">
        <nav className="p-4 border-b">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={handleDashboardClick}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${
                  pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : ''
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
                onClick={handleSurgerySchedulingClick}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${
                  pathname === '/programar-cirugia' ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H3a2 2 0 01-2-2v-4a2 2 0 012-2h4z" />
                </svg>
                <span className="text-gray-800">Programar Cirugia</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handlePatientsClick}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${
                  pathname === '/pacientes' ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-800">Pacientes</span>
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
                <span className="text-gray-800">Personal</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    </>
  );
};