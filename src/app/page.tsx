'use client';

import { useAuth } from '@/context/AuthContext';
import { Dashboard } from "@/components/Dashboard";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si está autenticado, redirigir al dashboard avanzado
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Si no está autenticado, mostrar el Dashboard con login
  if (!isAuthenticated) {
    return <Dashboard />;
  }

  // Loading state mientras redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
