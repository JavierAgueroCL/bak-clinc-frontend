export interface ScheduledSurgery {
  id: string;
  patient_id: string;
  doctor_id: string;
  surgery_type: string;
  scheduled_date: string;
  estimated_duration: number;
  operating_room: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  pre_surgery_notes: string | null;
  post_surgery_notes: string | null;
  anesthesia_type: string | null;
  assistant_doctor_id: string | null;
  created_at: string;
  updated_at: string;
  patient_name: string;
  patient_rut: string;
  doctor_first_name: string;
  doctor_last_name: string;
  assistant_first_name: string | null;
  assistant_last_name: string | null;
}

export interface CreateScheduledSurgeryRequest {
  patient_id: number;
  doctor_id: number;
  surgery_type: string;
  scheduled_date: string;
  estimated_duration: number;
  operating_room: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pre_surgery_notes?: string;
  anesthesia_type?: string;
  assistant_doctor_id?: number;
}

export interface UpdateScheduledSurgeryRequest {
  scheduled_date?: string;
  estimated_duration?: number;
  operating_room?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pre_surgery_notes?: string;
  post_surgery_notes?: string;
  anesthesia_type?: string;
  assistant_doctor_id?: number;
}

export interface UpdateSurgeryStatusRequest {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ScheduledSurgeryResponse {
  surgeries: ScheduledSurgery[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SurgeryStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: AvailableSlot[];
}