'use client';

import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { dashboardApi } from '@/services/api';
import {
  DashboardStats,
  SurgeryAnalytics,
  PatientAnalytics,
  DoctorPerformance,
  RoomUtilization,
  RevenueAnalytics,
  RealtimeDashboard,
  DashboardAlerts,
} from '@/types/dashboard';

interface DashboardData {
  stats?: DashboardStats;
  surgeryAnalytics?: SurgeryAnalytics;
  patientAnalytics?: PatientAnalytics;
  doctorPerformance?: DoctorPerformance;
  roomUtilization?: RoomUtilization;
  revenueAnalytics?: RevenueAnalytics;
  realtimeDashboard?: RealtimeDashboard;
  alerts?: DashboardAlerts;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('Loading dashboard data...');

      const [
        stats,
        surgeryAnalytics,
        patientAnalytics,
        doctorPerformance,
        roomUtilization,
        revenueAnalytics,
        realtimeDashboard,
        alerts,
      ] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSurgeryAnalytics({ period: 'month' }),
        dashboardApi.getPatientAnalytics(),
        dashboardApi.getDoctorPerformance(),
        dashboardApi.getRoomUtilization({ date: new Date().toISOString().split('T')[0], period: 'day' }),
        dashboardApi.getRevenueAnalytics(),
        dashboardApi.getRealtimeDashboard(),
        dashboardApi.getAlerts(),
      ]);

      setData({
        stats,
        surgeryAnalytics,
        patientAnalytics,
        doctorPerformance,
        roomUtilization,
        revenueAnalytics,
        realtimeDashboard,
        alerts,
      });

      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data
    loadDashboardData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array to run only once

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };


  if (loading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Última actualización: {data.realtimeDashboard?.currentDateTime ? formatDateTime(data.realtimeDashboard.currentDateTime) : 'Cargando...'}
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        {/* General Stats */}
        {data.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pacientes</h3>
              <p className="text-3xl font-bold text-blue-600">{data.stats.totalPatients}</p>
              <p className="text-sm text-gray-500">Total de pacientes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Cirugías</h3>
              <p className="text-3xl font-bold text-green-600">{data.stats.totalSurgeries}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Programadas: {data.stats.scheduledSurgeries}</div>
                <div>Pendientes: {data.stats.pendingSurgeries}</div>
                <div>Completadas: {data.stats.completedSurgeries}</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Doctores</h3>
              <p className="text-3xl font-bold text-purple-600">{data.stats.activeDoctors}/{data.stats.totalDoctors}</p>
              <p className="text-sm text-gray-500">Doctores activos</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Usuarios</h3>
              <p className="text-3xl font-bold text-orange-600">{data.stats.activeUsers}/{data.stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Usuarios activos</p>
            </div>
          </div>
        )}

        {/* Real-time Today's Stats */}
        {data.realtimeDashboard && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estado en Tiempo Real - Hoy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Cirugías de Hoy</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Programadas:</span>
                    <span className="font-medium">{data.realtimeDashboard.todayStats.scheduledSurgeries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">En Progreso:</span>
                    <span className="font-medium text-yellow-600">{data.realtimeDashboard.todayStats.inProgressSurgeries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completadas:</span>
                    <span className="font-medium text-green-600">{data.realtimeDashboard.todayStats.completedSurgeries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendientes:</span>
                    <span className="font-medium text-blue-600">{data.realtimeDashboard.todayStats.pendingSurgeries}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Estado Operacional</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctores Activos:</span>
                    <span className="font-medium">{data.realtimeDashboard.activeDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pabellones Ocupados:</span>
                    <span className="font-medium">{data.realtimeDashboard.busyOperatingRooms}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Próximas Cirugías</h3>
                {data.realtimeDashboard.nextSurgeries.length > 0 ? (
                  <div className="space-y-2">
                    {data.realtimeDashboard.nextSurgeries.slice(0, 3).map((surgery) => (
                      <div key={surgery.id} className="text-sm">
                        <div className="font-medium">{surgery.patient_name}</div>
                        <div className="text-gray-600">{surgery.surgery_type} - {surgery.scheduled_time}</div>
                        <div className="text-xs text-gray-500">{surgery.operating_room}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay cirugías programadas</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Surgery Analytics */}
          {data.surgeryAnalytics && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Cirugías ({data.surgeryAnalytics.period})</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{data.surgeryAnalytics.totalSurgeries}</p>
                  <p className="text-sm text-gray-500">Total de cirugías</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Por Estado:</h4>
                  <div className="space-y-1">
                    {Object.entries(data.surgeryAnalytics.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between text-sm">
                        <span className="capitalize">{status}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Por Prioridad:</h4>
                  <div className="space-y-1">
                    {Object.entries(data.surgeryAnalytics.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between text-sm">
                        <span className="capitalize">{priority}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Por Pabellón:</h4>
                  <div className="space-y-1">
                    {Object.entries(data.surgeryAnalytics.byOperatingRoom).map(([room, count]) => (
                      <div key={room} className="flex justify-between text-sm">
                        <span>{room}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Analytics */}
          {data.patientAnalytics && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Pacientes</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{data.patientAnalytics.totalPatients}</p>
                    <p className="text-sm text-gray-500">Total pacientes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{data.patientAnalytics.newPatientsThisMonth}</p>
                    <p className="text-sm text-gray-500">Nuevos este mes</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Pacientes Recientes:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {data.patientAnalytics.recentPatients.slice(0, 5).map((patient) => (
                      <div key={patient.id} className="text-sm border-b pb-1">
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-gray-600">RUT: {patient.rut}</div>
                        <div className="text-xs text-gray-500">Cirugías: {patient.totalsurgeries}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Performance */}
          {data.doctorPerformance && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rendimiento de Doctores</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{data.doctorPerformance.totalDoctors}</p>
                    <p className="text-sm text-gray-500">Total doctores</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{data.doctorPerformance.activeDoctors}</p>
                    <p className="text-sm text-gray-500">Doctores activos</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Top Doctores:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {data.doctorPerformance.topPerformers.slice(0, 5).map((doctor) => (
                      <div key={doctor.doctorId} className="text-sm border-b pb-1">
                        <div className="font-medium">Dr. {doctor.doctorName}</div>
                        <div className="text-gray-600">Cirugías: {doctor.totalSurgeries || 0}</div>
                        <div className="text-xs text-gray-500">Éxito: {doctor.successRate}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Utilization */}
          {data.roomUtilization && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Utilización de Pabellones</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{data.roomUtilization.overallUtilization.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Utilización general</p>
                </div>
                
                <div className="space-y-3">
                  {data.roomUtilization.rooms.map((room) => (
                    <div key={room.name} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{room.name}</h4>
                        <span className="text-sm font-medium">{room.utilizationRate.toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Ocupado: {room.occupiedSlots}/{room.totalSlots} slots
                      </div>
                      {room.surgeries.length > 0 && (
                        <div className="text-xs space-y-1">
                          {room.surgeries.map((surgery) => (
                            <div key={surgery.id} className="bg-gray-50 p-2 rounded">
                              <div className="font-medium">{surgery.patient_name}</div>
                              <div className="text-gray-600">{surgery.surgery_type} - {surgery.start_time}</div>
                              <div className="text-gray-500">Dr. {surgery.doctor_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Analytics */}
        {data.revenueAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Ingresos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Este Mes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ingresos:</span>
                    <span className="font-medium">${data.revenueAnalytics.thisMonth.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cirugías:</span>
                    <span className="font-medium">{data.revenueAnalytics.thisMonth.totalSurgeries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio:</span>
                    <span className="font-medium">${data.revenueAnalytics.thisMonth.averagePerSurgery.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Mes Anterior</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ingresos:</span>
                    <span className="font-medium">${data.revenueAnalytics.lastMonth.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cirugías:</span>
                    <span className="font-medium">{data.revenueAnalytics.lastMonth.totalSurgeries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio:</span>
                    <span className="font-medium">${data.revenueAnalytics.lastMonth.averagePerSurgery.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Crecimiento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ingresos:</span>
                    <span className={`font-medium ${data.revenueAnalytics.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.revenueAnalytics.growth.revenueGrowth >= 0 ? '+' : ''}{data.revenueAnalytics.growth.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cirugías:</span>
                    <span className={`font-medium ${data.revenueAnalytics.growth.surgeriesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.revenueAnalytics.growth.surgeriesGrowth >= 0 ? '+' : ''}{data.revenueAnalytics.growth.surgeriesGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {data.alerts && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Alertas y Notificaciones
              {data.alerts.unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {data.alerts.unreadCount}
                </span>
              )}
            </h2>
            {data.alerts.alerts.length > 0 ? (
              <div className="space-y-2">
                {data.alerts.alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">Alerta #{index + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay alertas activas</p>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}