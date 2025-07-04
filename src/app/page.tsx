'use client';

import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { Dashboard } from "@/components/Dashboard";
import { DashboardStats } from "@/components/DashboardStats";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Si no está autenticado, mostrar el Dashboard con login
  if (!isAuthenticated) {
    return <Dashboard />;
  }

  // Si está autenticado, mostrar el dashboard principal
  return (
    <AuthLayout title="BAK Clinic">
      <div className="space-y-6">
        <div className="text-center py-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bienvenido al Sistema BAK Clinic
          </h2>
          <p className="text-gray-600 text-lg">
            Panel de control y estadísticas
          </p>
        </div>
        <DashboardStats />
      </div>
    </AuthLayout>
  );
}
