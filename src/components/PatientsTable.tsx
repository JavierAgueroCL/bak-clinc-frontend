'use client';

import React, { useState } from 'react';
import { Patient } from '@/types/patient';
import { PatientModal } from './PatientModal';

// Datos de ejemplo sin backend
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Juan Pérez González',
    rut: '12.345.678-9',
    email: 'juan.perez@email.com',
    phone: '+56 9 1234 5678',
    registrationDate: '2024-01-15',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'María García López',
    rut: '98.765.432-1',
    email: 'maria.garcia@email.com',
    phone: '+56 9 8765 4321',
    registrationDate: '2024-02-20',
    createdAt: '2024-02-20T14:15:00Z',
    updatedAt: '2024-02-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Carlos López Martín',
    rut: '15.678.432-5',
    email: 'carlos.lopez@email.com',
    phone: '+56 9 5678 1234',
    registrationDate: '2024-03-10',
    createdAt: '2024-03-10T09:45:00Z',
    updatedAt: '2024-03-10T09:45:00Z'
  },
  {
    id: '4',
    name: 'Ana Rodríguez Silva',
    rut: '19.876.543-2',
    email: 'ana.rodriguez@email.com',
    phone: '+56 9 9876 5432',
    registrationDate: '2024-04-05',
    createdAt: '2024-04-05T16:20:00Z',
    updatedAt: '2024-04-05T16:20:00Z'
  },
  {
    id: '5',
    name: 'Luis Martín Torres',
    rut: '11.222.333-4',
    email: 'luis.martin@email.com',
    phone: '+56 9 1122 3344',
    registrationDate: '2024-05-12',
    createdAt: '2024-05-12T11:10:00Z',
    updatedAt: '2024-05-12T11:10:00Z'
  }
];

export const PatientsTable: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filtrar pacientes por término de búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.rut.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${patient.name}?`)) {
      setPatients(patients.filter(p => p.id !== patient.id));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const handleModalSave = (patientData: { name: string; rut: string; email: string; phone: string }) => {
    if (modalMode === 'create') {
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: patientData.name,
        rut: patientData.rut,
        email: patientData.email,
        phone: patientData.phone,
        registrationDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPatients([...patients, newPatient]);
    } else if (modalMode === 'edit' && selectedPatient) {
      const updatedPatient: Patient = {
        ...selectedPatient,
        name: patientData.name,
        rut: patientData.rut,
        email: patientData.email,
        phone: patientData.phone,
        updatedAt: new Date().toISOString()
      };
      setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    }
    handleModalClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra la información de los pacientes</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-sm text-gray-600">Total Pacientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{filteredPatients.length}</div>
          <div className="text-sm text-gray-600">Resultados</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {patients.filter(p => new Date(p.registrationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-sm text-gray-600">Nuevos (30 días)</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.rut}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                    <div className="text-sm text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(patient.registrationDate).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(patient)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-green-600 hover:text-green-800"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando un nuevo paciente.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <PatientModal
          mode={modalMode}
          patient={selectedPatient}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};