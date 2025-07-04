'use client';

import { AuthLayout } from '@/components/AuthLayout';
import { PatientsTable } from '@/components/PatientsTable';

export default function PatientsPage() {
  return (
    <AuthLayout title="BAK Clinic - Gestión de Pacientes">
      <PatientsTable />
    </AuthLayout>
  );
}