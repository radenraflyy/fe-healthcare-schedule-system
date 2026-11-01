import { type ReactNode, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { api } from './api';
import { AuthContext } from './auth-context';
import { clearSession, updateSessionUser, useSession } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [retryKey, setRetryKey] = useState(0);
  const validation = useQuery({
    queryKey: ['validateToken', session?.user.id, retryKey],
    queryFn: () => api.validateToken(session!.accessToken),
    enabled: Boolean(session?.accessToken),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });
  useEffect(() => {
    if (validation.data?.validateToken) updateSessionUser(validation.data.validateToken);
    if (validation.error?.message.includes('Sesi Anda telah berakhir')) clearSession();
  }, [validation.data, validation.error]);
  const serviceError =
    validation.error?.message && !validation.error.message.includes('Sesi Anda telah berakhir')
      ? validation.error.message
      : '';
  const user = validation.data?.validateToken ?? (serviceError ? null : (session?.user ?? null));
  const ready = !session?.accessToken || validation.isSuccess || validation.isError;
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        serviceError,
        retry: () => setRetryKey((value) => value + 1),
        signOut: clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
