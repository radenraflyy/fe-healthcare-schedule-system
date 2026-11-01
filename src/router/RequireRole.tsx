import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../data-services/auth-context';

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to='/appointments' replace />;
  return children;
}
