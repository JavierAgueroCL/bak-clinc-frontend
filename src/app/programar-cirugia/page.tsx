'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { selectStyles } from '@/styles/common';

interface Surgery {
  id: string;
  patientName: string;
  surgeryType: string;
  duration: string;
  durationMinutes: number;
  doctor: string;
  assignedPavilion?: string;
  assignedTime?: string;
}

interface ScheduledSurgery {
  id: string;
  patientName: string;
  surgeryType: string;
  duration: string;
  durationMinutes: number;
  doctor: string;
  pavilion: string;
  time: string;
  date: string;
}

const PAVILIONS = ['Pavellon 1', 'Pavellon 2', 'Pavellon 3', 'Emergencias'];
const START_HOUR = 8;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_MINUTES = TOTAL_HOURS * 60;
const GRID_MINUTE_HEIGHT = 1; // Each minute = 1px in grid

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
];

const PATIENTS = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Rodríguez', 'Luis Martín', 
  'Carmen Ruiz', 'Pedro Sánchez', 'Laura Fernández', 'David González', 'Sofia Torres'
];

const SURGERY_TYPES = [
  'Apendicectomía', 'Colecistectomía', 'Hernia Inguinal', 'Artroscopia', 
  'Cirugía Cardíaca', 'Neurocirugía', 'Cirugía Plástica', 'Traumatología',
  'Ginecología', 'Urología', 'Oftalmología', 'Otorrinolaringología'
];

const DOCTORS = [
  'Dr. García Martínez', 'Dr. López Fernández', 'Dra. Rodríguez Silva', 
  'Dr. Martín González', 'Dra. Sánchez Ruiz', 'Dr. Pérez Torres',
  'Dra. Fernández López', 'Dr. González Martín', 'Dra. Torres Pérez',
  'Dr. Silva Rodríguez', 'Dra. Ruiz Sánchez', 'Dr. Jiménez Morales'
];

const HOURS_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `${i + 1}h` }));
const MINUTES_OPTIONS = [
  { value: 0, label: '0min' },
  { value: 15, label: '15min' },
  { value: 30, label: '30min' },
  { value: 45, label: '45min' }
];

const mockPendingSurgeries: Surgery[] = [
  { id: '1', patientName: 'Juan Pérez', surgeryType: 'Apendicectomía', duration: '1h 30min', durationMinutes: 90, doctor: 'Dr. García Martínez' },
  { id: '2', patientName: 'María García', surgeryType: 'Colecistectomía', duration: '2h 15min', durationMinutes: 135, doctor: 'Dra. Rodríguez Silva' },
  { id: '3', patientName: 'Carlos López', surgeryType: 'Hernia Inguinal', duration: '1h 45min', durationMinutes: 105, doctor: 'Dr. López Fernández' },
  { id: '4', patientName: 'Ana Rodríguez', surgeryType: 'Artroscopia', duration: '1h 15min', durationMinutes: 75, doctor: 'Dra. Sánchez Ruiz' },
];

export default function ProgramarCirugia() {
  const [pendingSurgeries, setPendingSurgeries] = useState<Surgery[]>(mockPendingSurgeries);
  const [scheduledSurgeries, setScheduledSurgeries] = useState<ScheduledSurgery[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | ScheduledSurgery | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedSurgery, setDraggedSurgery] = useState<Surgery | null>(null);
  const [draggedScheduledSurgery, setDraggedScheduledSurgery] = useState<ScheduledSurgery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: '',
    surgeryType: '',
    doctor: '',
    hours: 1,
    minutes: 0,
    pavilion: '',
    date: '',
    time: ''
  });
  const [createForm, setCreateForm] = useState({
    patientName: PATIENTS[0],
    surgeryType: SURGERY_TYPES[0],
    doctor: DOCTORS[0],
    hours: 1,
    minutes: 0
  });

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

  const getOccupiedTimeSlots = (pavilion: string, startTime: string, durationMinutes: number) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const slots = [];
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
      slots.push(minutesToTime(minutes));
    }
    
    return slots;
  };

  const calculateRowSpan = (durationMinutes: number) => {
    // Calculate how many hour slots this surgery occupies
    // Each row represents 60 minutes
    return Math.ceil(durationMinutes / 60);
  };

  const getSurgeryHeight = (durationMinutes: number) => {
    // Each minute = 1px in the new grid system
    return durationMinutes * GRID_MINUTE_HEIGHT;
  };

  const getGridPosition = (time: string) => {
    const timeMinutes = timeToMinutes(time);
    const startMinutes = START_HOUR * 60; // 8:00 = 480 minutes
    return timeMinutes - startMinutes; // Position from start of day
  };

  const getTimeFromPosition = (position: number) => {
    const startMinutes = START_HOUR * 60;
    const totalMinutes = startMinutes + position;
    return minutesToTime(totalMinutes);
  };

  const snapToTimeSlot = (yPosition: number) => {
    // Snap to 15-minute intervals for better UX
    const snapInterval = 15;
    const snappedMinutes = Math.round(yPosition / snapInterval) * snapInterval;
    return Math.max(0, Math.min(snappedMinutes, TOTAL_MINUTES - 15));
  };

  const getCurrentDateScheduledSurgeries = () => {
    const dateKey = formatDateKey(currentDate);
    return scheduledSurgeries.filter(surgery => surgery.date === dateKey);
  };

  const handleEditSurgery = (surgery: Surgery | ScheduledSurgery) => {
    const hours = Math.floor(surgery.durationMinutes / 60);
    const minutes = surgery.durationMinutes % 60;
    
    setEditForm({
      patientName: surgery.patientName,
      surgeryType: surgery.surgeryType,
      doctor: surgery.doctor,
      hours,
      minutes,
      pavilion: 'pavilion' in surgery ? surgery.pavilion : '',
      date: 'date' in surgery ? surgery.date : formatDateKey(currentDate),
      time: 'time' in surgery ? surgery.time : ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSurgery) return;
    
    const newDuration = editForm.hours * 60 + editForm.minutes;
    
    // Validar duración mínima de 1 hora
    if (newDuration < 60) {
      alert('La duración mínima de una cirugía es de 1 hora');
      return;
    }
    
    const newDurationText = `${editForm.hours}h ${editForm.minutes}min`;
    
    if ('pavilion' in selectedSurgery) {
      // Es una cirugía programada
      const updatedSurgery: ScheduledSurgery = {
        ...selectedSurgery,
        patientName: editForm.patientName,
        surgeryType: editForm.surgeryType,
        doctor: editForm.doctor,
        duration: newDurationText,
        durationMinutes: newDuration,
        pavilion: editForm.pavilion,
        date: editForm.date,
        time: editForm.time
      };
      
      setScheduledSurgeries(scheduledSurgeries.map(s => 
        s.id === selectedSurgery.id ? updatedSurgery : s
      ));
      setSelectedSurgery(updatedSurgery);
    } else {
      // Es una cirugía pendiente
      const updatedSurgery: Surgery = {
        ...selectedSurgery,
        patientName: editForm.patientName,
        surgeryType: editForm.surgeryType,
        doctor: editForm.doctor,
        duration: newDurationText,
        durationMinutes: newDuration
      };
      
      setPendingSurgeries(pendingSurgeries.map(s => 
        s.id === selectedSurgery.id ? updatedSurgery : s
      ));
      setSelectedSurgery(updatedSurgery);
    }
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCreateSurgery = () => {
    setIsCreating(true);
  };

  const handleSaveCreate = () => {
    const newDuration = createForm.hours * 60 + createForm.minutes;
    
    // Validar duración mínima de 1 hora
    if (newDuration < 60) {
      alert('La duración mínima de una cirugía es de 1 hora');
      return;
    }
    
    const newDurationText = `${createForm.hours}h ${createForm.minutes}min`;
    
    const newSurgery: Surgery = {
      id: Date.now().toString(),
      patientName: createForm.patientName,
      surgeryType: createForm.surgeryType,
      doctor: createForm.doctor,
      duration: newDurationText,
      durationMinutes: newDuration
    };
    
    setPendingSurgeries([...pendingSurgeries, newSurgery]);
    setIsCreating(false);
    
    // Reset form
    setCreateForm({
      patientName: PATIENTS[0],
      surgeryType: SURGERY_TYPES[0],
      doctor: DOCTORS[0],
      hours: 1,
      minutes: 0
    });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    // Reset form
    setCreateForm({
      patientName: PATIENTS[0],
      surgeryType: SURGERY_TYPES[0],
      doctor: DOCTORS[0],
      hours: 1,
      minutes: 0
    });
  };

  const handleDragStart = (surgery: Surgery) => {
    setDraggedSurgery(surgery);
    setDraggedScheduledSurgery(null);
  };

  const handleScheduledSurgeryDragStart = (surgery: ScheduledSurgery) => {
    setDraggedScheduledSurgery(surgery);
    setDraggedSurgery(null);
  };

  const handleDropToPending = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedScheduledSurgery) {
      // Convert scheduled surgery back to pending surgery
      const pendingSurgery: Surgery = {
        id: draggedScheduledSurgery.id,
        patientName: draggedScheduledSurgery.patientName,
        surgeryType: draggedScheduledSurgery.surgeryType,
        doctor: draggedScheduledSurgery.doctor,
        duration: draggedScheduledSurgery.duration,
        durationMinutes: draggedScheduledSurgery.durationMinutes
      };
      
      // Remove from scheduled and add back to pending
      setScheduledSurgeries(scheduledSurgeries.filter(s => s.id !== draggedScheduledSurgery.id));
      setPendingSurgeries([...pendingSurgeries, pendingSurgery]);
      setDraggedScheduledSurgery(null);
    }
    
    // Clear any pending surgery drag state
    setDraggedSurgery(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGridDrop = (e: React.DragEvent, pavilion: string) => {
    e.preventDefault();
    const dateKey = formatDateKey(currentDate);
    
    // Get drop position relative to the grid
    const rect = e.currentTarget.getBoundingClientRect();
    const yOffset = e.clientY - rect.top;
    const snappedPosition = snapToTimeSlot(yOffset);
    const dropTime = getTimeFromPosition(snappedPosition);
    
    // Handle dropping a pending surgery
    if (draggedSurgery) {
      const startMinutes = timeToMinutes(dropTime);
      const endMinutes = startMinutes + draggedSurgery.durationMinutes;
      
      const currentDateSurgeries = getCurrentDateScheduledSurgeries();
      const hasConflict = currentDateSurgeries.some(surgery => {
        if (surgery.pavilion !== pavilion) return false;
        
        const surgeryStartMinutes = timeToMinutes(surgery.time);
        const surgeryEndMinutes = surgeryStartMinutes + surgery.durationMinutes;
        
        return (startMinutes < surgeryEndMinutes && endMinutes > surgeryStartMinutes);
      });
      
      if (hasConflict) {
        alert('Este horario ya está ocupado o se superpone con otra cirugía');
        return;
      }
      
      const newScheduledSurgery: ScheduledSurgery = {
        ...draggedSurgery,
        pavilion,
        time: dropTime,
        date: dateKey
      };
      
      setScheduledSurgeries([...scheduledSurgeries, newScheduledSurgery]);
      setPendingSurgeries(pendingSurgeries.filter(s => s.id !== draggedSurgery.id));
      setDraggedSurgery(null);
    }
    
    // Handle moving a scheduled surgery to a new time/pavilion
    if (draggedScheduledSurgery) {
      const startMinutes = timeToMinutes(dropTime);
      const endMinutes = startMinutes + draggedScheduledSurgery.durationMinutes;
      
      const currentDateSurgeries = getCurrentDateScheduledSurgeries();
      const hasConflict = currentDateSurgeries.some(surgery => {
        // Exclude the surgery being moved from conflict detection
        if (surgery.id === draggedScheduledSurgery.id) return false;
        if (surgery.pavilion !== pavilion) return false;
        
        const surgeryStartMinutes = timeToMinutes(surgery.time);
        const surgeryEndMinutes = surgeryStartMinutes + surgery.durationMinutes;
        
        return (startMinutes < surgeryEndMinutes && endMinutes > surgeryStartMinutes);
      });
      
      if (hasConflict) {
        alert('Este horario ya está ocupado o se superpone con otra cirugía');
        return;
      }
      
      // Update the scheduled surgery with new time/pavilion
      const updatedScheduledSurgery: ScheduledSurgery = {
        ...draggedScheduledSurgery,
        pavilion,
        time: dropTime,
        date: dateKey
      };
      
      // Replace the old scheduled surgery with the updated one
      setScheduledSurgeries(scheduledSurgeries.map(surgery => 
        surgery.id === draggedScheduledSurgery.id ? updatedScheduledSurgery : surgery
      ));
      setDraggedScheduledSurgery(null);
    }
  };

  const isTimeSlotOccupied = (pavilion: string, time: string) => {
    const currentDateSurgeries = getCurrentDateScheduledSurgeries();
    const currentMinutes = timeToMinutes(time);
    
    return currentDateSurgeries.some(surgery => {
      if (surgery.pavilion !== pavilion) return false;
      
      const surgeryStartMinutes = timeToMinutes(surgery.time);
      const surgeryEndMinutes = surgeryStartMinutes + surgery.durationMinutes;
      
      return currentMinutes >= surgeryStartMinutes && currentMinutes < surgeryEndMinutes;
    });
  };

  const getScheduledSurgery = (pavilion: string, time: string) => {
    const currentDateSurgeries = getCurrentDateScheduledSurgeries();
    const currentMinutes = timeToMinutes(time);
    
    return currentDateSurgeries.find(surgery => {
      if (surgery.pavilion !== pavilion) return false;
      
      const surgeryStartMinutes = timeToMinutes(surgery.time);
      const surgeryEndMinutes = surgeryStartMinutes + surgery.durationMinutes;
      
      return currentMinutes >= surgeryStartMinutes && currentMinutes < surgeryEndMinutes;
    });
  };

  const getSurgeryRowSpan = (surgery: ScheduledSurgery, timeSlot: string) => {
    if (surgery.time === timeSlot) {
      return calculateRowSpan(surgery.durationMinutes);
    }
    return 0;
  };

  const shouldShowTimeSlot = (pavilion: string, time: string) => {
    const currentDateSurgeries = getCurrentDateScheduledSurgeries();
    const currentMinutes = timeToMinutes(time);
    
    const occupyingSurgery = currentDateSurgeries.find(surgery => {
      if (surgery.pavilion !== pavilion) return false;
      
      const surgeryStartMinutes = timeToMinutes(surgery.time);
      const surgeryEndMinutes = surgeryStartMinutes + surgery.durationMinutes;
      
      return currentMinutes >= surgeryStartMinutes && currentMinutes < surgeryEndMinutes;
    });
    
    if (occupyingSurgery) {
      return occupyingSurgery.time === time;
    }
    
    return true;
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
              <h2 className="text-lg font-semibold text-gray-800">Cirugías Pendientes</h2>
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
              {pendingSurgeries.map((surgery) => (
                <div
                  key={surgery.id}
                  draggable
                  onDragStart={() => handleDragStart(surgery)}
                  onClick={() => setSelectedSurgery(surgery)}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-move hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-800">{surgery.patientName}</h3>
                  <p className="text-sm text-gray-600">{surgery.surgeryType}</p>
                  <p className="text-xs text-green-600">{surgery.doctor}</p>
                  <p className="text-sm text-blue-600 font-medium">{surgery.duration}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Column 2: Pavilion Calendar */}
          <div className="col-span-8 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-lg font-semibold text-gray-800">
                Horario Pavellones - {formatDate(currentDate)}
              </h2>
              
              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {/* Time labels column */}
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
                          .filter(surgery => surgery.pavilion === pavilion)
                          .map((surgery) => (
                            <div
                              key={surgery.id}
                              draggable
                              onDragStart={() => handleScheduledSurgeryDragStart(surgery)}
                              onClick={() => setSelectedSurgery(surgery)}
                              className="absolute left-1 right-1 bg-green-200 border border-green-300 rounded p-2 cursor-move hover:bg-green-300 transition-colors shadow-sm"
                              style={{
                                top: `${getGridPosition(surgery.time)}px`,
                                height: `${getSurgeryHeight(surgery.durationMinutes)}px`,
                                zIndex: 10
                              }}
                            >
                              <div className="text-xs font-medium text-gray-800 truncate">{surgery.patientName}</div>
                              <div className="text-xs text-gray-600 truncate">{surgery.surgeryType}</div>
                              <div className="text-xs text-green-600 truncate">{surgery.doctor}</div>
                              <div className="text-xs text-green-700 font-medium">{surgery.duration}</div>
                            </div>
                          ))}
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
              <h2 className="text-lg font-semibold text-gray-800">Detalle del Paciente</h2>
              {selectedSurgery && !isEditing && (
                <button
                  onClick={() => handleEditSurgery(selectedSurgery)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Editar
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              {selectedSurgery ? (
                <div className="space-y-4">
                  {isEditing ? (
                    // Modo edición
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                        <select
                          value={editForm.patientName}
                          onChange={(e) => setEditForm({...editForm, patientName: e.target.value})}
                          className={selectStyles.base}
                        >
                          {PATIENTS.map(patient => (
                            <option key={patient} value={patient}>{patient}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                        <select
                          value={editForm.surgeryType}
                          onChange={(e) => setEditForm({...editForm, surgeryType: e.target.value})}
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
                          value={editForm.doctor}
                          onChange={(e) => setEditForm({...editForm, doctor: e.target.value})}
                          className={selectStyles.base}
                        >
                          {DOCTORS.map(doctor => (
                            <option key={doctor} value={doctor}>{doctor}</option>
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
                      
                      {'pavilion' in selectedSurgery && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pabellón Asignado</label>
                            <select
                              value={editForm.pavilion}
                              onChange={(e) => setEditForm({...editForm, pavilion: e.target.value})}
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
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    // Modo solo lectura
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.patientName}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.surgeryType}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.doctor}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{selectedSurgery.duration}</p>
                        </div>
                      </div>
                      
                      {'pavilion' in selectedSurgery && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pabellón Asignado</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{selectedSurgery.pavilion}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{selectedSurgery.date}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Programada</label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-800">{selectedSurgery.time}</p>
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
                  value={createForm.patientName}
                  onChange={(e) => setCreateForm({...createForm, patientName: e.target.value})}
                  className={selectStyles.base}
                >
                  {PATIENTS.map(patient => (
                    <option key={patient} value={patient}>{patient}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cirugía</label>
                <select
                  value={createForm.surgeryType}
                  onChange={(e) => setCreateForm({...createForm, surgeryType: e.target.value})}
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
                  value={createForm.doctor}
                  onChange={(e) => setCreateForm({...createForm, doctor: e.target.value})}
                  className={selectStyles.base}
                >
                  {DOCTORS.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={createForm.hours}
                    onChange={(e) => setCreateForm({...createForm, hours: parseInt(e.target.value)})}
                    className={selectStyles.base}
                  >
                    {HOURS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={createForm.minutes}
                    onChange={(e) => setCreateForm({...createForm, minutes: parseInt(e.target.value)})}
                    className={selectStyles.base}
                  >
                    {MINUTES_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
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