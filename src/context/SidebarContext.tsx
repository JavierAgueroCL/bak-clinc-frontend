'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      setIsCollapsed(true);
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setIsCollapsed(false);
    }
  };

  const setSidebarOpen = (open: boolean) => {
    setIsSidebarOpen(open);
    if (open) {
      setIsCollapsed(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, isCollapsed, toggleSidebar, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};