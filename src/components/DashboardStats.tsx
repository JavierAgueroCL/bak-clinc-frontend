'use client';

import React from 'react';

// Datos de ejemplo para estadísticas
const statsData = {
  totalPatients: 142,
  totalSurgeries: 89,
  pendingSurgeries: 12,
  patientsThisMonth: 28,
  surgeriesThisMonth: 15
};

// Datos de ejemplo para gráficos mensuales
const monthlyPatientsData = [
  { month: 'Ene', patients: 18 },
  { month: 'Feb', patients: 22 },
  { month: 'Mar', patients: 25 },
  { month: 'Abr', patients: 19 },
  { month: 'May', patients: 28 },
  { month: 'Jun', patients: 30 }
];

const monthlySurgeriesData = [
  { month: 'Ene', surgeries: 12 },
  { month: 'Feb', surgeries: 15 },
  { month: 'Mar', surgeries: 18 },
  { month: 'Abr', surgeries: 14 },
  { month: 'May', surgeries: 15 },
  { month: 'Jun', surgeries: 15 }
];

export const DashboardStats: React.FC = () => {
  const maxPatients = Math.max(...monthlyPatientsData.map(d => d.patients));
  const maxSurgeries = Math.max(...monthlySurgeriesData.map(d => d.surgeries));

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Pacientes</dt>
                <dd className="text-lg font-medium text-gray-900">{statsData.totalPatients}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H3a2 2 0 01-2-2v-4a2 2 0 012-2h4z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Cirugías</dt>
                <dd className="text-lg font-medium text-gray-900">{statsData.totalSurgeries}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Cirugías Pendientes</dt>
                <dd className="text-lg font-medium text-gray-900">{statsData.pendingSurgeries}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Actividad del Mes</dt>
                <dd className="text-lg font-medium text-gray-900">{statsData.patientsThisMonth + statsData.surgeriesThisMonth}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pacientes por Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pacientes por Mes</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyPatientsData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-200 rounded-t-lg relative">
                  <div
                    className="bg-blue-500 rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(data.patients / maxPatients) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 font-medium">{data.month}</div>
                <div className="text-sm text-gray-700 font-semibold">{data.patients}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Cirugías por Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cirugías por Mes</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlySurgeriesData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-200 rounded-t-lg relative">
                  <div
                    className="bg-green-500 rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(data.surgeries / maxSurgeries) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 font-medium">{data.month}</div>
                <div className="text-sm text-gray-700 font-semibold">{data.surgeries}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de accesos rápidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/pacientes"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Gestionar Pacientes</h4>
              <p className="text-sm text-gray-500">Ver, crear y editar pacientes</p>
            </div>
          </a>

          <a
            href="/programar-cirugia"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H3a2 2 0 01-2-2v-4a2 2 0 012-2h4z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Programar Cirugías</h4>
              <p className="text-sm text-gray-500">Gestionar horarios de pabellones</p>
            </div>
          </a>

          <a
            href="/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Gestionar Personal</h4>
              <p className="text-sm text-gray-500">Administrar cuentas del sistema</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};