'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';

interface PatientModalProps {
  mode: 'view' | 'edit' | 'create';
  patient: Patient | null;
  onClose: () => void;
  onSave: (patientData: PatientFormData) => void;
}

interface PatientFormData {
  name: string;
  rut: string;
  email: string;
  phone: string;
}

export const PatientModal: React.FC<PatientModalProps> = ({ mode, patient, onClose, onSave }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    rut: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        rut: patient.rut || '',
        email: patient.email || '',
        phone: patient.phone || '',
      });
    } else {
      setFormData({
        name: '',
        rut: '',
        email: '',
        phone: '',
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateRUT = (rut: string) => {
    // Validación básica de RUT chileno
    const rutRegex = /^[0-9]+[-|‐]{1}[0-9kK]{1}$/;
    return rutRegex.test(rut);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validateRUT(formData.rut)) {
      newErrors.rut = 'El formato del RUT no es válido (ej: 12345678-9)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    if (validateForm()) {
      onSave(formData);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'Ver Paciente';
      case 'edit': return 'Editar Paciente';
      case 'create': return 'Crear Paciente';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {mode === 'view' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-gray-900">{patient?.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <p className="text-gray-900">{patient?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <p className="text-gray-900">{patient?.rut}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{patient?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="text-gray-900">{patient?.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                  <p className="text-gray-900">
                    {patient ? new Date(patient.registrationDate).toLocaleDateString('es-ES') : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                  <p className="text-gray-900">
                    {patient ? new Date(patient.createdAt).toLocaleString('es-ES') : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                  <p className="text-gray-900">
                    {patient ? new Date(patient.updatedAt).toLocaleString('es-ES') : ''}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.rut ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345678-9"
                  />
                  {errors.rut && <p className="mt-1 text-sm text-red-600">{errors.rut}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+56 9 1234 5678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {mode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};