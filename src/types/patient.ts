export interface Patient {
  id: number;
  full_name: string;
  rut: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  full_name: string;
  rut: string;
  email: string;
  phone?: string;
}

export interface UpdatePatientRequest {
  full_name?: string;
  phone?: string;
}

export interface PatientResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
}