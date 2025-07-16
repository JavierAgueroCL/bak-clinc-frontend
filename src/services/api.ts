import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  User,
} from '@/types/auth';
import {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientResponse,
  PatientStats,
} from '@/types/patient';
import {
  ScheduledSurgery,
  CreateScheduledSurgeryRequest,
  UpdateScheduledSurgeryRequest,
  UpdateSurgeryStatusRequest,
  ScheduledSurgeryResponse,
  SurgeryStats,
  AvailableSlotsResponse,
} from '@/types/surgery';
import {
  DashboardStats,
  SurgeryAnalytics,
  PatientAnalytics,
  DoctorPerformance,
  RoomUtilization,
  RevenueAnalytics,
  RealtimeDashboard,
  DashboardAlerts,
  SurgeryAnalyticsParams,
  RoomUtilizationParams,
} from '@/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config: RequestInit = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new ApiError(response.status, `Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      // Handle validation errors with errors array
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorMessage = data.errors.join(', ');
        throw new ApiError(response.status, errorMessage);
      }
      
      throw new ApiError(response.status, data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, `Network error: No se puede conectar al servidor. Verifica que el backend esté funcionando en ${API_BASE_URL}`);
    }
    
    throw new ApiError(500, `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProfile(): Promise<User> {
    return fetchApi<User>('/api/auth/profile');
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; resetToken: string }> {
    return fetchApi<{ message: string; resetToken: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async healthCheck(): Promise<{ status: string }> {
    return fetchApi<{ status: string }>('/health');
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';
    return fetchApi<{ users: User[]; total: number; page: number; limit: number }>(endpoint);
  },

  async getUserById(id: number): Promise<{ user: User }> {
    return fetchApi<{ user: User }>(`/api/users/${id}`);
  },

  async createUser(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'patient' | 'doctor' | 'admin';
  }): Promise<{ message: string; user: User }> {
    return fetchApi<{ message: string; user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: number, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: 'patient' | 'doctor' | 'admin';
  }): Promise<{ message: string; user: User }> {
    return fetchApi<{ message: string; user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  async deactivateUser(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  async activateUser(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/users/${id}/activate`, {
      method: 'PATCH',
    });
  },

  async updateUserPassword(id: number, data: { newPassword: string }): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const patientApi = {
  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    rut?: string;
    email?: string;
  }): Promise<PatientResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/patients?${queryString}` : '/api/patients';
    return fetchApi<PatientResponse>(endpoint);
  },

  async getPatientById(id: number): Promise<{ patient: Patient }> {
    return fetchApi<{ patient: Patient }>(`/api/patients/${id}`);
  },

  async getPatientByRut(rut: string): Promise<{ patient: Patient }> {
    return fetchApi<{ patient: Patient }>(`/api/patients/rut/${encodeURIComponent(rut)}`);
  },

  async getPatientByEmail(email: string): Promise<{ patient: Patient }> {
    return fetchApi<{ patient: Patient }>(`/api/patients/email/${encodeURIComponent(email)}`);
  },

  async getPatientStats(): Promise<PatientStats> {
    return fetchApi<PatientStats>('/api/patients/stats');
  },

  async createPatient(data: CreatePatientRequest): Promise<{ message: string; patient: Patient }> {
    return fetchApi<{ message: string; patient: Patient }>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePatient(id: number, data: UpdatePatientRequest): Promise<{ message: string; patient: Patient }> {
    return fetchApi<{ message: string; patient: Patient }>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePatient(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

export const surgeryApi = {
  async getScheduledSurgeries(params?: {
    page?: number;
    limit?: number;
    patient_id?: number;
    doctor_id?: number;
    status?: string;
    priority?: string;
    operating_room?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<ScheduledSurgeryResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/scheduled-surgeries?${queryString}` : '/api/scheduled-surgeries';
    return fetchApi<ScheduledSurgeryResponse>(endpoint);
  },

  async getSurgeryById(id: string): Promise<{ surgery: ScheduledSurgery }> {
    return fetchApi<{ surgery: ScheduledSurgery }>(`/api/scheduled-surgeries/${id}`);
  },

  async getUpcomingSurgeries(days: number = 30): Promise<{ surgeries: ScheduledSurgery[] }> {
    return fetchApi<{ surgeries: ScheduledSurgery[] }>(`/api/scheduled-surgeries/upcoming?days=${days}`);
  },

  async getSurgeryStats(): Promise<SurgeryStats> {
    return fetchApi<SurgeryStats>('/api/scheduled-surgeries/statistics');
  },

  async getSurgeriesByDateRange(startDate: string, endDate: string): Promise<{ surgeries: ScheduledSurgery[] }> {
    return fetchApi<{ surgeries: ScheduledSurgery[] }>(`/api/scheduled-surgeries/date-range?start_date=${startDate}&end_date=${endDate}`);
  },

  async getAvailableSlots(date: string, operatingRoom?: string): Promise<AvailableSlotsResponse> {
    const queryParams = new URLSearchParams();
    if (operatingRoom) {
      queryParams.append('operating_room', operatingRoom);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/scheduled-surgeries/available-slots/${date}?${queryString}` : `/api/scheduled-surgeries/available-slots/${date}`;
    return fetchApi<AvailableSlotsResponse>(endpoint);
  },

  async getSurgeriesByDoctor(doctorId: number, includeAssistant: boolean = false): Promise<{ surgeries: ScheduledSurgery[] }> {
    const queryParams = new URLSearchParams();
    if (includeAssistant) {
      queryParams.append('include_assistant', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/scheduled-surgeries/doctor/${doctorId}?${queryString}` : `/api/scheduled-surgeries/doctor/${doctorId}`;
    return fetchApi<{ surgeries: ScheduledSurgery[] }>(endpoint);
  },

  async getSurgeriesByStatus(status: string): Promise<{ surgeries: ScheduledSurgery[] }> {
    return fetchApi<{ surgeries: ScheduledSurgery[] }>(`/api/scheduled-surgeries/status/${status}`);
  },

  async createScheduledSurgery(data: CreateScheduledSurgeryRequest): Promise<{ message: string; data: ScheduledSurgery }> {
    return fetchApi<{ message: string; data: ScheduledSurgery }>('/api/scheduled-surgeries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateScheduledSurgery(id: string, data: UpdateScheduledSurgeryRequest): Promise<{ message: string; data: ScheduledSurgery }> {
    console.log('[API] updateScheduledSurgery called with:');
    console.log('[API] - ID:', id, '(type:', typeof id, ')');
    console.log('[API] - Data:', data);
    console.log('[API] - URL will be:', `/api/scheduled-surgeries/${id}`);
    
    return fetchApi<{ message: string; data: ScheduledSurgery }>(`/api/scheduled-surgeries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateSurgeryStatus(id: string, data: UpdateSurgeryStatusRequest): Promise<{ message: string; data: ScheduledSurgery }> {
    return fetchApi<{ message: string; data: ScheduledSurgery }>(`/api/scheduled-surgeries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async cancelScheduledSurgery(id: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/scheduled-surgeries/${id}`, {
      method: 'DELETE',
    });
  },

  async getPendingSurgeries(params?: {
    page?: number;
    limit?: number;
    patient_id?: number;
    doctor_id?: number;
    priority?: string;
    search?: string;
  }): Promise<{ surgeries: ScheduledSurgery[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/scheduled-surgeries/pending?${queryString}` : '/api/scheduled-surgeries/pending';
    
    // Backend returns { message, data } instead of { surgeries, total, page, limit }
    const response = await fetchApi<{ message: string; data: ScheduledSurgery[] }>(endpoint);
    
    // Transform to expected format
    return {
      surgeries: response.data,
      total: response.data.length,
      page: params?.page || 1,
      limit: params?.limit || 100
    };
  },

  async createPendingSurgery(data: {
    patient_id: number;
    doctor_id: number;
    surgery_type: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    pre_surgery_notes?: string;
    anesthesia_type?: string;
    assistant_doctor_id?: number;
  }): Promise<{ message: string; data: ScheduledSurgery }> {
    console.log('[API] createPendingSurgery called with:', data);
    const response = await fetchApi<{ message: string; data: ScheduledSurgery }>('/api/scheduled-surgeries/pending', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('[API] createPendingSurgery response:', response);
    return response;
  },
};

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    return fetchApi<DashboardStats>('/api/dashboard/stats');
  },

  async getSurgeryAnalytics(params?: SurgeryAnalyticsParams): Promise<SurgeryAnalytics> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/dashboard/surgeries/analytics?${queryString}` : '/api/dashboard/surgeries/analytics';
    return fetchApi<SurgeryAnalytics>(endpoint);
  },

  async getPatientAnalytics(): Promise<PatientAnalytics> {
    return fetchApi<PatientAnalytics>('/api/dashboard/patients/analytics');
  },

  async getDoctorPerformance(): Promise<DoctorPerformance> {
    return fetchApi<DoctorPerformance>('/api/dashboard/doctors/performance');
  },

  async getRoomUtilization(params?: RoomUtilizationParams): Promise<RoomUtilization> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/dashboard/operating-rooms/utilization?${queryString}` : '/api/dashboard/operating-rooms/utilization';
    return fetchApi<RoomUtilization>(endpoint);
  },

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return fetchApi<RevenueAnalytics>('/api/dashboard/revenue/analytics');
  },

  async getRealtimeDashboard(): Promise<RealtimeDashboard> {
    return fetchApi<RealtimeDashboard>('/api/dashboard/realtime');
  },

  async getAlerts(): Promise<DashboardAlerts> {
    return fetchApi<DashboardAlerts>('/api/dashboard/alerts');
  },
};

export { ApiError };