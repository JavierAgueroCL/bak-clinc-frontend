'use client';

import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { selectStyles } from '@/styles/common';
import { surgeryApi, patientApi, authApi, ApiError } from '@/services/api';
import { ScheduledSurgery } from '@/types/surgery';
import { Patient } from '@/types/patient';
import { User } from '@/types/auth';

// Local interface for pending surgeries (not yet scheduled)
interface PendingSurgery {
  id: string;
  patient_id: number;
  patient_name: string;
  surgery_type: string;
  duration?: string;
  estimated_duration?: number;
  doctor_id: number;
  doctor_name: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pre_surgery_notes?: string;
  anesthesia_type?: string;
}

const PAVILIONS = ['Sala A', 'Sala B', 'Sala C', 'Emergencias'];
const START_HOUR = 8;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_MINUTES = TOTAL_HOURS * 60;
const GRID_MINUTE_HEIGHT = 1; // Each minute = 1px in grid

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
];

const SURGERY_TYPES = [
  'Apendicectomía', 'Colecistectomía', 'Hernia Inguinal', 'Artroscopia', 
  'Cirugía Cardíaca', 'Neurocirugía', 'Cirugía Plástica', 'Traumatología',
  'Ginecología', 'Urología', 'Oftalmología', 'Otorrinolaringología'
];

const HOURS_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `${i + 1}h` }));
const MINUTES_OPTIONS = [
  { value: 0, label: '0min' },
  { value: 15, label: '15min' },
  { value: 30, label: '30min' },
  { value: 45, label: '45min' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const ANESTHESIA_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'General', label: 'General' },
  { value: 'Regional', label: 'Regional' },
  { value: 'Local', label: 'Local' },
  { value: 'Sedación', label: 'Sedación' }
];

export default function ProgramarCirugia() {
  const [pendingSurgeries, setPendingSurgeries] = useState<PendingSurgery[]>([]);
  const [scheduledSurgeries, setScheduledSurgeries] = useState<ScheduledSurgery[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<PendingSurgery | ScheduledSurgery | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedSurgery, setDraggedSurgery] = useState<PendingSurgery | null>(null);
  const [draggedScheduledSurgery, setDraggedScheduledSurgery] = useState<ScheduledSurgery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [editForm, setEditForm] = useState({
    patient_id: 0,
    surgery_type: '',
    doctor_id: 0,
    hours: 1,
    minutes: 0,
    operating_room: '',
    date: '',
    time: ''
  });
  const [createForm, setCreateForm] = useState({
    patient_id: 0,
    surgery_type: SURGERY_TYPES[0],
    doctor_id: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    pre_surgery_notes: '',
    anesthesia_type: ''
  });

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load patients and doctors (these endpoints exist)
      const [patientsResponse, usersResponse] = await Promise.all([
        patientApi.getPatients({ limit: 100 }),
        authApi.getUsers({ limit: 100, role: 'doctor' })
      ]);
      
      setPatients(patientsResponse.patients);
      setDoctors(usersResponse.users);
      
      // Load surgeries data
      // Note: Using getScheduledSurgeries with status filter instead of getPendingSurgeries 
      // because the backend /pending endpoint has a bug that returns cancelled surgeries
      const [scheduledSurgeriesResponse, pendingSurgeriesResponse] = await Promise.all([
        surgeryApi.getScheduledSurgeries({ limit: 100, status: 'scheduled' }),
        surgeryApi.getScheduledSurgeries({ limit: 100, status: 'pending' })
      ]);
      
      setScheduledSurgeries(scheduledSurgeriesResponse.surgeries);
      
      // Convert backend pending surgeries to local format
      const pendingSurgeriesFormatted: PendingSurgery[] = pendingSurgeriesResponse.surgeries.map(surgery => ({
        id: surgery.id,
        patient_id: parseInt(surgery.patient_id),
        patient_name: surgery.patient_name,
        surgery_type: surgery.surgery_type,
        doctor_id: parseInt(surgery.doctor_id),
        doctor_name: `${surgery.doctor_first_name} ${surgery.doctor_last_name}`,
        priority: surgery.priority || 'medium',
        pre_surgery_notes: surgery.pre_surgery_notes || '',
        anesthesia_type: surgery.anesthesia_type || ''
      }));
      
      setPendingSurgeries(pendingSurgeriesFormatted);
      
      // Initialize form with first patient and doctor if available
      if (patientsResponse.patients.length > 0 && usersResponse.users.length > 0) {
        setCreateForm({
          patient_id: patientsResponse.patients[0].id,
          surgery_type: SURGERY_TYPES[0],
          doctor_id: usersResponse.users[0].id,
          priority: 'medium',
          pre_surgery_notes: '',
          anesthesia_type: ''
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar datos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('editForm updated:', editForm);
  }, [editForm]);


  const formatDate = (date: Date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getSurgeryHeight = (durationMinutes: number) => {
    return durationMinutes * GRID_MINUTE_HEIGHT;
  };

  const getGridPosition = (time: string) => {
    const timeMinutes = timeToMinutes(time);
    const startMinutes = START_HOUR * 60;
    return timeMinutes - startMinutes;
  };

  const getTimeFromPosition = (position: number) => {
    const startMinutes = START_HOUR * 60;
    const totalMinutes = startMinutes + position;
    return minutesToTime(totalMinutes);
  };

  const snapToTimeSlot = (yPosition: number) => {
    const snapInterval = 15;
    const snappedMinutes = Math.round(yPosition / snapInterval) * snapInterval;
    return Math.max(0, Math.min(snappedMinutes, TOTAL_MINUTES - 15));
  };

  const getCurrentDateScheduledSurgeries = () => {
    // Don't filter if still loading or if no surgeries exist
    if (loading || !scheduledSurgeries || scheduledSurgeries.length === 0) {
      return [];
    }
    
    const dateKey = formatDateKey(currentDate);
    return scheduledSurgeries.filter(surgery => {
      // Add null checks to prevent runtime errors
      if (!surgery || !surgery.scheduled_date) {
        console.warn('Surgery object is missing scheduled_date:', surgery);
        return false;
      }
      try {
        const surgeryDate = new Date(surgery.scheduled_date).toISOString().split('T')[0];
        return surgeryDate === dateKey;
      } catch (error) {
        console.error('Error parsing surgery date:', surgery.scheduled_date, error);
        return false;
      }
    });
  };
  
  const getTimeFromScheduledDate = (scheduledDate: string) => {
    if (!scheduledDate) {
      console.warn('scheduledDate is undefined or null');
      return '00:00';
    }
    try {
      const date = new Date(scheduledDate);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', scheduledDate);
        return '00:00';
      }
      
      // Try to extract time from the original ISO string if it looks like UTC
      if (scheduledDate.includes('T') && scheduledDate.includes('Z')) {
        // It's an ISO string in UTC, extract the time part directly
        const timePart = scheduledDate.split('T')[1];
        if (timePart) {
          const timeOnly = timePart.split('.')[0] || timePart.split('Z')[0];
          if (timeOnly && timeOnly.includes(':')) {
            return timeOnly.substring(0, 5); // Return HH:MM
          }
        }
      }
      
      // Fallback to local time
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error parsing scheduled date:', scheduledDate, error);
      return '00:00';
    }
  };

  const addTimeProperty = (surgery: ScheduledSurgery) => {
    return {
      ...surgery,
      time: getTimeFromScheduledDate(surgery.scheduled_date)
    };
  };

  const handleEditSurgery = (surgery: PendingSurgery | ScheduledSurgery) => {
    const duration = surgery.estimated_duration || 60; // Default to 1 hour if not set
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    // Validate that we have valid IDs
    const patientId = Number(surgery.patient_id);
    const doctorId = Number(surgery.doctor_id);
    
    if (isNaN(patientId) || isNaN(doctorId)) {
      console.error('Invalid IDs in surgery object:', { 
        patientId, 
        doctorId, 
        originalPatientId: surgery.patient_id,
        originalDoctorId: surgery.doctor_id,
        surgery 
      });
      alert('Error: La cirugía tiene IDs inválidos. No se puede editar.');
      return;
    }
    
    if ('operating_room' in surgery) {
      // Scheduled surgery - ensure IDs are numbers
      setEditForm({
        patient_id: patientId,
        surgery_type: surgery.surgery_type,
        doctor_id: doctorId,
        hours,
        minutes,
        operating_room: surgery.operating_room,
        date: surgery.scheduled_date ? new Date(surgery.scheduled_date).toISOString().split('T')[0] : '',
        time: getTimeFromScheduledDate(surgery.scheduled_date)
      });
    } else {
      // Pending surgery - ensure IDs are numbers
      setEditForm({
        patient_id: patientId,
        surgery_type: surgery.surgery_type,
        doctor_id: doctorId,
        hours,
        minutes,
        operating_room: '',
        date: formatDateKey(currentDate),
        time: ''
      });
    }
    setSelectedSurgery(surgery);
    setIsEditing(true);
    setEditError(null); // Clear any previous edit errors
  };

  const handleSaveEdit = async () => {
    if (!selectedSurgery) return;
    
    // Clear any previous edit errors
    setEditError(null);
    
    try {
      const newDuration = editForm.hours * 60 + editForm.minutes;
      
      if (newDuration < 60) {
        setEditError('La duración mínima de una cirugía es de 1 hora');
        return;
      }
      
      if ('operating_room' in selectedSurgery) {
        // Es una cirugía programada - actualizar en backend
        console.log('Editing scheduled surgery with form data:', editForm);
        
        // Validate form data
        if (!editForm.date || !editForm.time) {
          setEditError('Fecha y hora son requeridos para cirugías programadas');
          return;
        }
        
        // Create the scheduled datetime preserving timezone consistency
        // Use UTC construction to avoid timezone conversion issues
        const [year, month, day] = editForm.date.split('-').map(Number);
        const [hours, minutes] = editForm.time.split(':').map(Number);
        const scheduledDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        
        console.log('Updating surgery with:', {
          scheduled_date: scheduledDateTime.toISOString(),
          estimated_duration: newDuration,
          operating_room: editForm.operating_room
        });
        
        const updatedSurgery = await surgeryApi.updateScheduledSurgery(selectedSurgery.id, {
          scheduled_date: scheduledDateTime.toISOString(),
          estimated_duration: newDuration,
          operating_room: editForm.operating_room
        });
        
        console.log('Updated surgery response from edit:', updatedSurgery);
        
        // API returns {message, data}
        const surgeryData = updatedSurgery.data;
        
        if (!surgeryData || !surgeryData.id) {
          console.error('Invalid surgery data received from API in edit:', updatedSurgery);
          setEditError('La cirugía fue actualizada pero la respuesta es inválida');
          return;
        }
        
        console.log('API surgery response:', surgeryData);
        console.log('Original surgery data:', selectedSurgery);
        
        // Merge API response with original surgery data to preserve missing fields
        const mergedSurgeryData = {
          ...selectedSurgery,
          ...surgeryData,
          // Preserve doctor name fields if missing from API response
          doctor_first_name: surgeryData.doctor_first_name || selectedSurgery.doctor_first_name,
          doctor_last_name: surgeryData.doctor_last_name || selectedSurgery.doctor_last_name,
          patient_name: surgeryData.patient_name || selectedSurgery.patient_name
        };
        
        console.log('Merged surgery data:', mergedSurgeryData);
        
        setScheduledSurgeries(scheduledSurgeries.map(s => 
          s.id === selectedSurgery.id ? mergedSurgeryData : s
        ));
        setSelectedSurgery(mergedSurgeryData);
      } else {
        // Es una cirugía pendiente - actualizar solo localmente
        console.log('Edit form data:', editForm);
        console.log('Available patients:', patients.length, patients.map(p => ({id: p.id, type: typeof p.id})));
        console.log('Available doctors:', doctors.length, doctors.map(d => ({id: d.id, type: typeof d.id})));
        
        // Handle both string and number ID types with robust comparison
        const selectedPatient = patients.find(p => 
          Number(p.id) === Number(editForm.patient_id) || 
          String(p.id) === String(editForm.patient_id)
        );
        const selectedDoctor = doctors.find(d => 
          Number(d.id) === Number(editForm.doctor_id) || 
          String(d.id) === String(editForm.doctor_id)
        );
        
        if (!selectedPatient || !selectedDoctor) {
          console.error('Validation failed:', {
            patientId: editForm.patient_id,
            doctorId: editForm.doctor_id,
            availablePatients: patients.map(p => ({id: p.id, name: p.full_name})),
            availableDoctors: doctors.map(d => ({id: d.id, name: `${d.first_name} ${d.last_name}`}))
          });
          alert(`Por favor selecciona un paciente y doctor válidos. Paciente ID: ${editForm.patient_id}, Doctor ID: ${editForm.doctor_id}`);
          return;
        }
        
        const updatedSurgery: PendingSurgery = {
          ...selectedSurgery,
          patient_id: editForm.patient_id,
          patient_name: selectedPatient.full_name,
          surgery_type: editForm.surgery_type,
          duration: `${editForm.hours}h ${editForm.minutes}min`,
          estimated_duration: newDuration,
          doctor_id: editForm.doctor_id,
          doctor_name: `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
        };
        
        setPendingSurgeries(pendingSurgeries.map(s => 
          s.id === selectedSurgery.id ? updatedSurgery : s
        ));
        setSelectedSurgery(updatedSurgery);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving surgery edit:', err);
      if (err instanceof ApiError) {
        setEditError(`Error al guardar cambios: ${err.message}`);
      } else {
        setEditError('Error al guardar cambios. Por favor intenta nuevamente.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleDeleteSurgery = async () => {
    if (!selectedSurgery) return;
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas cancelar esta cirugía?\n\nPaciente: ${selectedSurgery.patient_name}\nTipo: ${selectedSurgery.surgery_type}\n\nEsta acción cambiará el estado a 'cancelado'.`
    );
    
    if (!confirmDelete) return;
    
    try {
      if ('operating_room' in selectedSurgery) {
        // Es una cirugía programada - cambiar estado a 'cancelled'
        console.log('Attempting to cancel scheduled surgery:', selectedSurgery.id);
        console.log('Surgery data:', selectedSurgery);
        
        // Validate surgery ID
        if (!selectedSurgery.id) {
          throw new Error('Surgery ID is missing or invalid');
        }
        
        // Verify the status update request data
        const statusUpdateData = { status: 'cancelled' as const };
        console.log('Status update data:', statusUpdateData);
        
        const response = await surgeryApi.updateSurgeryStatus(selectedSurgery.id, statusUpdateData);
        console.log('Cancel surgery API response:', response);
        
        // Remover de la lista de cirugías programadas (ya no se muestra en pavellones)
        setScheduledSurgeries(scheduledSurgeries.filter(s => s.id !== selectedSurgery.id));
        console.log('Surgery removed from scheduled list');
      } else {
        // Es una cirugía pendiente - también debe actualizar el estado en el backend
        console.log('Attempting to cancel pending surgery:', selectedSurgery.id);
        console.log('Pending surgery data:', selectedSurgery);
        
        // Validate surgery ID
        if (!selectedSurgery.id) {
          throw new Error('Pending surgery ID is missing or invalid');
        }
        
        // Las cirugías pendientes también son ScheduledSurgery en el backend, solo que con status diferente
        // Usamos el mismo endpoint para actualizar el status a 'cancelled'
        const statusUpdateData = { status: 'cancelled' as const };
        console.log('Status update data for pending surgery:', statusUpdateData);
        
        const response = await surgeryApi.updateSurgeryStatus(selectedSurgery.id, statusUpdateData);
        console.log('Cancel pending surgery API response:', response);
        
        // Remover de la lista de cirugías pendientes en el frontend
        setPendingSurgeries(pendingSurgeries.filter(s => s.id !== selectedSurgery.id));
        console.log('Pending surgery removed from local list');
      }
      
      // Limpiar la selección y salir del modo edición
      setSelectedSurgery(null);
      setIsEditing(false);
      
      alert('Cirugía cancelada exitosamente');
    } catch (err) {
      console.error('Delete surgery error details:', err);
      if (err instanceof ApiError) {
        console.error('API Error details:', {
          status: err.status,
          message: err.message
        });
        setError(err.message);
        alert(`Error al cancelar cirugía: ${err.message}\n\nStatus: ${err.status}\n\nRevisa la consola para más detalles.`);
      } else {
        console.error('Unknown error:', err);
        setError('Error al eliminar cirugía');
        alert('Error al eliminar cirugía. Revisa la consola para más detalles.');
      }
    }
  };

  const handleCreateSurgery = () => {
    // Reinitialize form with first available patient and doctor
    if (patients.length > 0 && doctors.length > 0) {
      setCreateForm({
        patient_id: patients[0].id,
        surgery_type: SURGERY_TYPES[0],
        doctor_id: doctors[0].id,
        priority: 'medium',
        pre_surgery_notes: '',
        anesthesia_type: ''
      });
    }
    setIsCreating(true);
  };

  // Create surgery as pending (not scheduled to pavilions yet)
  const handleSaveCreate = async () => {
    try {
      const selectedPatient = patients.find(p => p.id === createForm.patient_id);
      const selectedDoctor = doctors.find(d => d.id === createForm.doctor_id);
      
      if (!selectedPatient || !selectedDoctor) {
        alert('Por favor selecciona un paciente y doctor válidos');
        return;
      }
      
      // Create pending surgery using backend API
      const pendingSurgeryData = {
        patient_id: createForm.patient_id,
        doctor_id: createForm.doctor_id,
        surgery_type: createForm.surgery_type,
        priority: createForm.priority,
        ...(createForm.pre_surgery_notes && { pre_surgery_notes: createForm.pre_surgery_notes }),
        ...(createForm.anesthesia_type && { anesthesia_type: createForm.anesthesia_type })
      };
      
      console.log('Creating pending surgery with data:', pendingSurgeryData);
      const response = await surgeryApi.createPendingSurgery(pendingSurgeryData);
      console.log('Raw API response:', response);
      
      // Handle different response formats - backend returns {message, data}
      const surgeryData = response.data || response;
      console.log('Extracted surgery data:', surgeryData);
      
      // Validate that we got a proper surgery object with ID
      if (!surgeryData || !surgeryData.id) {
        console.error('Invalid surgery data received from API:', surgeryData);
        throw new Error('El servidor no devolvió un ID válido para la cirugía creada');
      }
      
      console.log('Surgery created with ID:', surgeryData.id);
      
      // Convert backend response to local format and add to state
      const newPendingSurgery: PendingSurgery = {
        id: surgeryData.id,
        patient_id: createForm.patient_id, // Use the form values instead of backend response
        patient_name: selectedPatient?.full_name || 'Paciente desconocido',
        surgery_type: surgeryData.surgery_type,
        doctor_id: createForm.doctor_id, // Use the form values instead of backend response
        doctor_name: selectedDoctor ? `${selectedDoctor.first_name} ${selectedDoctor.last_name}` : 'Doctor desconocido',
        priority: surgeryData.priority || 'medium',
        pre_surgery_notes: surgeryData.pre_surgery_notes || '',
        anesthesia_type: surgeryData.anesthesia_type || ''
      };
      
      setPendingSurgeries([...pendingSurgeries, newPendingSurgery]);
      
      setIsCreating(false);
      
      // Reset form
      if (patients.length > 0 && doctors.length > 0) {
        setCreateForm({
          patient_id: patients[0].id,
          surgery_type: SURGERY_TYPES[0],
          doctor_id: doctors[0].id,
          priority: 'medium',
          pre_surgery_notes: '',
          anesthesia_type: ''
        });
      }
      
      alert('Cirugía agregada a la lista de pendientes exitosamente. Arrastra la cirugía desde la lista de pendientes hacia un pabellón para programarla en el horario deseado.');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        alert(`Error al crear cirugía pendiente: ${err.message}`);
      } else {
        setError('Error al crear cirugía pendiente');
        alert('Error al crear cirugía pendiente');
      }
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    if (patients.length > 0 && doctors.length > 0) {
      setCreateForm({
        patient_id: patients[0].id,
        surgery_type: SURGERY_TYPES[0],
        doctor_id: doctors[0].id,
        priority: 'medium',
        pre_surgery_notes: '',
        anesthesia_type: ''
      });
    }
  };

  const handleDragStart = (surgery: PendingSurgery) => {
    setDraggedSurgery(surgery);
    setDraggedScheduledSurgery(null);
  };

  const handleScheduledSurgeryDragStart = (surgery: ScheduledSurgery) => {
    setDraggedScheduledSurgery(surgery);
    setDraggedSurgery(null);
  };

  const handleDropToPending = async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedScheduledSurgery) {
      try {
        await surgeryApi.cancelScheduledSurgery(draggedScheduledSurgery.id);
        
        const pendingSurgery: PendingSurgery = {
          id: draggedScheduledSurgery.id,
          patient_id: parseInt(draggedScheduledSurgery.patient_id),
          patient_name: draggedScheduledSurgery.patient_name,
          surgery_type: draggedScheduledSurgery.surgery_type,
          duration: `${Math.floor(draggedScheduledSurgery.estimated_duration / 60)}h ${draggedScheduledSurgery.estimated_duration % 60}min`,
          estimated_duration: draggedScheduledSurgery.estimated_duration,
          doctor_id: parseInt(draggedScheduledSurgery.doctor_id),
          doctor_name: `${draggedScheduledSurgery.doctor_first_name} ${draggedScheduledSurgery.doctor_last_name}`
        };
        
        setScheduledSurgeries(scheduledSurgeries.filter(s => s.id !== draggedScheduledSurgery.id));
        setPendingSurgeries([...pendingSurgeries, pendingSurgery]);
        setDraggedScheduledSurgery(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al cancelar cirugía');
        }
      }
    }
    
    setDraggedSurgery(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGridDrop = async (e: React.DragEvent, operatingRoom: string) => {
    e.preventDefault();
    const dateKey = formatDateKey(currentDate);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const yOffset = e.clientY - rect.top;
    const snappedPosition = snapToTimeSlot(yOffset);
    const dropTime = getTimeFromPosition(snappedPosition);
    
    console.log('Drop details:', {
      yOffset,
      snappedPosition,
      dropTime,
      dateKey,
      operatingRoom
    });
    
    if (draggedSurgery) {
      try {
        const startMinutes = timeToMinutes(dropTime);
        const surgeryDuration = draggedSurgery.estimated_duration || 60; // Default to 1 hour
        const endMinutes = startMinutes + surgeryDuration;
        
        const currentDateSurgeries = getCurrentDateScheduledSurgeries();
        const hasConflict = currentDateSurgeries.some(surgery => {
          if (surgery.operating_room !== operatingRoom) return false;
          
          const surgeryTime = getTimeFromScheduledDate(surgery.scheduled_date);
          const surgeryStartMinutes = timeToMinutes(surgeryTime);
          const surgeryEndMinutes = surgeryStartMinutes + surgery.estimated_duration;
          
          return (startMinutes < surgeryEndMinutes && endMinutes > surgeryStartMinutes);
        });
        
        if (hasConflict) {
          alert('Este horario ya está ocupado o se superpone con otra cirugía');
          return;
        }
        
        // Create the scheduled datetime preserving timezone consistency
        // Use UTC construction to avoid timezone conversion issues
        const [year, month, day] = dateKey.split('-').map(Number);
        const [hours, minutes] = dropTime.split(':').map(Number);
        const scheduledDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        
        // Update the existing pending surgery instead of creating a new one
        console.log('Updating existing pending surgery:', draggedSurgery.id);
        console.log('Surgery ID type:', typeof draggedSurgery.id);
        console.log('Surgery ID value:', JSON.stringify(draggedSurgery.id));
        console.log('Full surgery object:', draggedSurgery);
        
        // Validate that we have a valid ID
        if (!draggedSurgery.id || draggedSurgery.id === 'undefined' || draggedSurgery.id === 'null') {
          throw new Error(`Invalid surgery ID: ${draggedSurgery.id}. Cannot update surgery.`);
        }
        
        // Ensure ID is a string (should already be, but let's be explicit)
        const surgeryId = String(draggedSurgery.id).trim();
        console.log('Converted surgery ID:', surgeryId);
        
        if (!surgeryId || surgeryId === 'undefined' || surgeryId === 'null') {
          throw new Error(`Surgery ID is empty or invalid after conversion: "${surgeryId}"`);
        }
        
        const updateData = {
          scheduled_date: scheduledDateTime.toISOString(),
          estimated_duration: surgeryDuration,
          operating_room: operatingRoom,
          priority: draggedSurgery.priority || 'medium',
          pre_surgery_notes: draggedSurgery.pre_surgery_notes,
          anesthesia_type: draggedSurgery.anesthesia_type
        };
        
        console.log('About to call updateScheduledSurgery with:');
        console.log('- Surgery ID:', surgeryId);
        console.log('- Update data:', updateData);
        
        const updatedSurgery = await surgeryApi.updateScheduledSurgery(surgeryId, updateData);
        
        // Update the status to 'scheduled' to move it from pending to scheduled
        console.log('Updating surgery status to scheduled for ID:', surgeryId);
        await surgeryApi.updateSurgeryStatus(surgeryId, { status: 'scheduled' });
        
        console.log('Updated surgery from drag:', updatedSurgery);
        
        // API returns {message, data}
        const surgeryData = updatedSurgery.data;
        
        if (!surgeryData || !surgeryData.scheduled_date) {
          console.error('Invalid surgery object received from API:', updatedSurgery);
          alert('Error: La cirugía fue actualizada pero no tiene fecha válida');
          return;
        }
        
        console.log('Update API surgery response:', surgeryData);
        console.log('Original pending surgery data:', draggedSurgery);
        
        // Create scheduled surgery with preserved display data from pending surgery
        const updatedScheduledSurgeryData = {
          ...surgeryData,
          // Preserve display fields from pending surgery
          patient_name: surgeryData.patient_name || draggedSurgery.patient_name,
          doctor_first_name: surgeryData.doctor_first_name || (draggedSurgery.doctor_name ? draggedSurgery.doctor_name.split(' ')[0] : ''),
          doctor_last_name: surgeryData.doctor_last_name || (draggedSurgery.doctor_name ? draggedSurgery.doctor_name.split(' ').slice(1).join(' ') : ''),
          surgery_type: surgeryData.surgery_type || draggedSurgery.surgery_type,
          estimated_duration: surgeryData.estimated_duration || draggedSurgery.estimated_duration || 60
        };
        
        console.log('Enhanced scheduled surgery data:', updatedScheduledSurgeryData);
        
        // The surgery was successfully updated as scheduled, now remove it from pending list and add to scheduled
        console.log('Surgery successfully scheduled, moving from pending to scheduled list');
        
        setScheduledSurgeries([...scheduledSurgeries, updatedScheduledSurgeryData]);
        setPendingSurgeries(pendingSurgeries.filter(s => s.id !== draggedSurgery.id));
        setDraggedSurgery(null);
        
        // Success message
        console.log(`Cirugía programada exitosamente para ${draggedSurgery.patient_name} en ${operatingRoom} a las ${dropTime}`);
        
      } catch (err) {
        console.error('Error during drag and drop operation:', err);
        if (err instanceof ApiError) {
          alert(`Error al programar cirugía: ${err.message}`);
        } else {
          alert('Error al programar cirugía. Por favor, intenta nuevamente.');
        }
        setDraggedSurgery(null); // Reset drag state even on error
      }
    }
    
    if (draggedScheduledSurgery) {
      try {
        const startMinutes = timeToMinutes(dropTime);
        const endMinutes = startMinutes + draggedScheduledSurgery.estimated_duration;
        
        const currentDateSurgeries = getCurrentDateScheduledSurgeries();
        const hasConflict = currentDateSurgeries.some(surgery => {
          if (surgery.id === draggedScheduledSurgery.id) return false;
          if (surgery.operating_room !== operatingRoom) return false;
          
          const surgeryTime = getTimeFromScheduledDate(surgery.scheduled_date);
          const surgeryStartMinutes = timeToMinutes(surgeryTime);
          const surgeryEndMinutes = surgeryStartMinutes + surgery.estimated_duration;
          
          return (startMinutes < surgeryEndMinutes && endMinutes > surgeryStartMinutes);
        });
        
        if (hasConflict) {
          alert('Este horario ya está ocupado o se superpone con otra cirugía');
          return;
        }
        
        // Create the scheduled datetime preserving timezone consistency
        // Use UTC construction to avoid timezone conversion issues
        const [year, month, day] = dateKey.split('-').map(Number);
        const [hours, minutes] = dropTime.split(':').map(Number);
        const scheduledDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        
        console.log('Moving scheduled surgery:', {
          surgeryId: draggedScheduledSurgery.id,
          originalTime: getTimeFromScheduledDate(draggedScheduledSurgery.scheduled_date),
          newTime: dropTime,
          originalDateTime: draggedScheduledSurgery.scheduled_date,
          newDateTime: scheduledDateTime.toISOString(),
          dateKey,
          operatingRoom,
          parsedDate: { year, month: month - 1, day, hours, minutes }
        });
        
        const updatedSurgery = await surgeryApi.updateScheduledSurgery(draggedScheduledSurgery.id, {
          scheduled_date: scheduledDateTime.toISOString(),
          operating_room: operatingRoom
        });
        
        console.log('Updated surgery response from API:', updatedSurgery);
        
        // API returns {message, data}
        const surgeryData = updatedSurgery.data;
        
        if (!surgeryData || !surgeryData.id) {
          console.error('Invalid surgery data received from API:', updatedSurgery);
          alert('Error: La cirugía fue actualizada pero la respuesta es inválida');
          return;
        }
        
        console.log('Drag API surgery response:', surgeryData);
        console.log('Original dragged surgery data:', draggedScheduledSurgery);
        
        // Merge API response with original surgery data to preserve missing fields
        const mergedSurgeryData = {
          ...draggedScheduledSurgery,
          ...surgeryData,
          // Preserve display fields if missing from API response
          doctor_first_name: surgeryData.doctor_first_name || draggedScheduledSurgery.doctor_first_name,
          doctor_last_name: surgeryData.doctor_last_name || draggedScheduledSurgery.doctor_last_name,
          patient_name: surgeryData.patient_name || draggedScheduledSurgery.patient_name,
          surgery_type: surgeryData.surgery_type || draggedScheduledSurgery.surgery_type,
          estimated_duration: surgeryData.estimated_duration || draggedScheduledSurgery.estimated_duration
        };
        
        console.log('Merged dragged surgery data:', mergedSurgeryData);
        
        setScheduledSurgeries(scheduledSurgeries.map(surgery => 
          surgery.id === draggedScheduledSurgery.id ? mergedSurgeryData : surgery
        ));
        setDraggedScheduledSurgery(null);
      } catch (err) {
        if (err instanceof ApiError) {
          alert(`Error al mover cirugía: ${err.message}`);
        } else {
          alert('Error al mover cirugía');
        }
        // Reset drag state even on error to prevent UI issues
        setDraggedScheduledSurgery(null);
      }
    }
  };

  return (
    <AuthLayout title="BAK Clinic - Programar Cirugía">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-12 gap-6 flex-1" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Column 1: Pending Surgeries */}
          <div 
            className="col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={handleDropToPending}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Cirugías Pendientes</h2>
                <p className="text-xs text-gray-500">
                  {pendingSurgeries.length} pendientes • {scheduledSurgeries.length} programadas en total
                </p>
              </div>
              <button
                onClick={handleCreateSurgery}
                className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                title="Agregar nueva cirugía"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Cargando...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">
                  <p>{error}</p>
                  <button 
                    onClick={loadData} 
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Reintentar
                  </button>
                </div>
              ) : pendingSurgeries.map((surgery) => {
                const priorityColors = {
                  low: 'bg-gray-50 border-gray-200',
                  medium: 'bg-blue-50 border-blue-200',
                  high: 'bg-yellow-50 border-yellow-200',
                  urgent: 'bg-red-50 border-red-200'
                };
                const priorityColor = priorityColors[surgery.priority || 'medium'];
                
                return (
                  <div
                    key={surgery.id}
                    draggable
                    onDragStart={() => handleDragStart(surgery)}
                    onClick={() => setSelectedSurgery(surgery)}
                    className={`${priorityColor} rounded-lg p-3 cursor-move hover:opacity-80 transition-colors`}
                  >
                    <h3 className="font-medium text-gray-800">{surgery.patient_name}</h3>
                    <p className="text-sm text-gray-600">{surgery.surgery_type}</p>
                    <p className="text-xs text-green-600">{surgery.doctor_name}</p>
                    {surgery.priority && (
                      <p className="text-xs text-gray-500 mt-1">
                        Prioridad: {PRIORITY_OPTIONS.find(p => p.value === surgery.priority)?.label}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Column 2: Pavilion Calendar */}
          <div className="col-span-8 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Día anterior"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Horario Pavellones
                </h2>
                <p className="text-sm text-gray-600">
                  {formatDate(currentDate)}
                </p>
                <p className="text-xs text-gray-500">
                  {getCurrentDateScheduledSurgeries().length} cirugías programadas este día
                </p>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mt-1 hover:bg-blue-200"
                >
                  Ir a hoy
                </button>
              </div>
              
              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Día siguiente"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="flex">
                {/* Time Labels */}
                <div className="w-16 bg-gray-50 border-r border-gray-300">
                  <div className="h-8 border-b border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                    Hora
                  </div>
                  {TIME_SLOTS.map((time) => (
                    <div 
                      key={time}
                      className="h-16 border-b border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700"
                    >
                      {time}
                    </div>
                  ))}
                </div>
                
                {/* Pavilions Grid */}
                <div className="flex-1 grid grid-cols-4 gap-0">
                  {PAVILIONS.map((pavilion) => (
                    <div key={pavilion} className="border-r border-gray-300 last:border-r-0">
                      {/* Pavilion Header */}
                      <div className="h-8 bg-gray-50 border-b border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                        {pavilion}
                      </div>
                      
                      {/* Pavilion Schedule Area */}
                      <div 
                        className="relative bg-white hover:bg-gray-50 transition-colors"
                        style={{ height: `${TOTAL_MINUTES}px` }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleGridDrop(e, pavilion)}
                      >
                        {/* Hour grid lines */}
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                          <div
                            key={i}
                            className="absolute w-full border-b border-gray-200"
                            style={{ top: `${i * 60}px` }}
                          />
                        ))}
                        
                        {/* 15-minute grid lines (lighter) */}
                        {Array.from({ length: TOTAL_HOURS * 4 }, (_, i) => (
                          <div
                            key={`quarter-${i}`}
                            className="absolute w-full border-b border-gray-100"
                            style={{ top: `${i * 15}px` }}
                          />
                        ))}
                        
                        {/* Scheduled Surgeries */}
                        {getCurrentDateScheduledSurgeries()
                          .filter(surgery => surgery.operating_room === pavilion)
                          .map((surgery) => {
                            const surgeryWithTime = addTimeProperty(surgery);
                            return (
                              <div
                                key={surgery.id}
                                draggable
                                onDragStart={() => handleScheduledSurgeryDragStart(surgery)}
                                onClick={() => setSelectedSurgery(surgery)}
                                className="absolute left-1 right-1 bg-green-200 border border-green-300 rounded p-2 cursor-move hover:bg-green-300 transition-colors shadow-sm"
                                style={{
                                  top: `${getGridPosition(surgeryWithTime.time)}px`,
                                  height: `${getSurgeryHeight(surgery.estimated_duration)}px`,
                                  zIndex: 10
                                }}
                              >
                                <div className="text-xs font-medium text-gray-800 truncate">{surgery.patient_name}</div>
                                <div className="text-xs text-gray-600 truncate">{surgery.surgery_type}</div>
                                <div className="text-xs text-green-600 truncate">{surgery.doctor_first_name} {surgery.doctor_last_name}</div>
                                <div
                                  className="text-xs text-green-700"
                                  style={{
                                    float: 'right',
                                    marginTop: '-16px'
                                  }}
                                >
                                  {Math.floor(surgery.estimated_duration / 60)}h {surgery.estimated_duration % 60}min
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 3: Patient Detail */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Editar Cirugía</h2>
              {selectedSurgery && !isEditing && (
                <button
                  onClick={() => handleEditSurgery(selectedSurgery)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Editar
                </button>
              )}
            </div>
            
            {/* Edit Error Display */}
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{editError}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        onClick={() => setEditError(null)}
                        className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              {selectedSurgery ? (
                <div className="space-y-4">
                  {(() => {
                    console.log('Selected surgery data:', selectedSurgery);
                    return null;
                  })()}
                  {isEditing ? (
                    // Modo edición
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                        <select
                          value={editForm.patient_id}
                          onChange={(e) => {
                            const newPatientId = parseInt(e.target.value);
                            console.log('Changing patient to:', newPatientId);
                            setEditForm({...editForm, patient_id: newPatientId});
                          }}
                          className={selectStyles.base}
                        >
                          {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                        <select
                          value={editForm.surgery_type}
                          onChange={(e) => setEditForm({...editForm, surgery_type: e.target.value})}
                          className={selectStyles.base}
                        >
                          {SURGERY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                        <select
                          value={editForm.doctor_id}
                          onChange={(e) => {
                            const newDoctorId = parseInt(e.target.value);
                            console.log('Changing doctor to:', newDoctorId);
                            setEditForm({...editForm, doctor_id: newDoctorId});
                          }}
                          className={selectStyles.base}
                        >
                          {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.last_name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editForm.hours}
                            onChange={(e) => setEditForm({...editForm, hours: parseInt(e.target.value)})}
                            className={selectStyles.base}
                          >
                            {HOURS_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <select
                            value={editForm.minutes}
                            onChange={(e) => setEditForm({...editForm, minutes: parseInt(e.target.value)})}
                            className={selectStyles.base}
                          >
                            {MINUTES_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {'operating_room' in selectedSurgery && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sala de Operaciones</label>
                            <select
                              value={editForm.operating_room}
                              onChange={(e) => setEditForm({...editForm, operating_room: e.target.value})}
                              className={selectStyles.base}
                            >
                              {PAVILIONS.map(pavilion => (
                                <option key={pavilion} value={pavilion}>{pavilion}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              className={selectStyles.base}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Programada</label>
                            <input
                              type="time"
                              value={editForm.time}
                              onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                              className={selectStyles.base}
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="flex space-x-2 pt-4">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center"
                          title="Guardar cambios"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleDeleteSurgery}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center"
                          title="Eliminar cirugía"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center justify-center"
                          title="Cancelar edición"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Modo solo lectura
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.patient_name || 'Paciente no especificado'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.surgery_type}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{
                            (() => {
                              // Handle different surgery data structures
                              if ('doctor_name' in selectedSurgery && selectedSurgery.doctor_name) {
                                return selectedSurgery.doctor_name;
                              } else if ('doctor_first_name' in selectedSurgery) {
                                const firstName = selectedSurgery.doctor_first_name || '';
                                const lastName = selectedSurgery.doctor_last_name || '';
                                if (firstName || lastName) {
                                  return `${firstName} ${lastName}`.trim();
                                }
                              }
                              return 'Médico no especificado';
                            })()
                          }</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{
                            'duration' in selectedSurgery && selectedSurgery.duration
                              ? selectedSurgery.duration 
                              : selectedSurgery.estimated_duration
                              ? `${Math.floor(selectedSurgery.estimated_duration / 60)}h ${selectedSurgery.estimated_duration % 60}min`
                              : 'No especificada'
                          }</p>
                        </div>
                      </div>
                      
                      {'operating_room' in selectedSurgery && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sala de Operaciones</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{selectedSurgery.operating_room}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{selectedSurgery.scheduled_date ? new Date(selectedSurgery.scheduled_date).toLocaleDateString('es-ES') : 'Fecha no disponible'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Programada</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{getTimeFromScheduledDate(selectedSurgery.scheduled_date)}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Selecciona una cirugía para ver los detalles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Lightbox para crear cirugía */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw max-h-90vh overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Cirugía Pendiente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                <select
                  value={createForm.patient_id}
                  onChange={(e) => setCreateForm({...createForm, patient_id: parseInt(e.target.value)})}
                  className={selectStyles.base}
                >
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                <select
                  value={createForm.surgery_type}
                  onChange={(e) => setCreateForm({...createForm, surgery_type: e.target.value})}
                  className={selectStyles.base}
                >
                  {SURGERY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                <select
                  value={createForm.doctor_id}
                  onChange={(e) => setCreateForm({...createForm, doctor_id: parseInt(e.target.value)})}
                  className={selectStyles.base}
                >
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.last_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({...createForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'})}
                  className={selectStyles.base}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Anestesia</label>
                <select
                  value={createForm.anesthesia_type}
                  onChange={(e) => setCreateForm({...createForm, anesthesia_type: e.target.value})}
                  className={selectStyles.base}
                >
                  {ANESTHESIA_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Pre-Cirugía</label>
                <textarea
                  value={createForm.pre_surgery_notes}
                  onChange={(e) => setCreateForm({...createForm, pre_surgery_notes: e.target.value})}
                  className={selectStyles.base}
                  rows={3}
                  placeholder="Instrucciones especiales, preparación previa, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button
                onClick={handleSaveCreate}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Crear Cirugía
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}