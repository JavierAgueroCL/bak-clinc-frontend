export interface Patient {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  name: string;
  rut: string;
  email: string;
  phone: string;
}

export interface UpdatePatientRequest {
  name?: string;
  rut?: string;
  email?: string;
  phone?: string;
}