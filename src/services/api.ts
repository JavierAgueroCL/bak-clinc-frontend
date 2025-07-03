import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  User,
} from '@/types/auth';

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

export { ApiError };