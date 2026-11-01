import { useSyncExternalStore } from 'react';

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'DOCTOR' | 'CUSTOMER';
  createdAt: string;
};
export type Session = { accessToken: string; user: User };
const KEY = 'rata-healthcare-session';
let snapshot: Session | null = readSession();
const listeners = new Set<() => void>();

function readSession(): Session | null {
  try {
    const value = localStorage.getItem(KEY);
    return value ? (JSON.parse(value) as Session) : null;
  } catch {
    return null;
  }
}
function notify() {
  listeners.forEach((listener) => listener());
}
export function getSessionToken() {
  return snapshot?.accessToken ?? null;
}
export function getSession() {
  return snapshot;
}
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}
export function saveSession(session: Session) {
  snapshot = session;
  localStorage.setItem(KEY, JSON.stringify(session));
  notify();
}
export function updateSessionUser(user: User) {
  if (snapshot) saveSession({ ...snapshot, user });
}
export function clearSession() {
  snapshot = null;
  localStorage.removeItem(KEY);
  notify();
}
