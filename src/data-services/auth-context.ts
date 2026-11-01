import { createContext, useContext } from 'react';

import type { User } from './session';

export type AuthState = {
  user: User | null;
  ready: boolean;
  serviceError: string;
  retry: () => void;
  signOut: () => void;
};
export const AuthContext = createContext<AuthState>({
  user: null,
  ready: false,
  serviceError: '',
  retry: () => {},
  signOut: () => {},
});
export function useAuth() {
  return useContext(AuthContext);
}
