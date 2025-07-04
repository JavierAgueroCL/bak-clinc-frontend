'use client';

import { AuthLayout } from '@/components/AuthLayout';
import { UsersTable } from '@/components/UsersTable';

export default function UsersPage() {
  return (
    <AuthLayout title="BAK Clinic - Personal">
      <UsersTable />
    </AuthLayout>
  );
}