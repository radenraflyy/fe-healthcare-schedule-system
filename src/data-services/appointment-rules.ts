export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export function canCustomerCancel(status: AppointmentStatus, scheduledAt: string, now: number) {
  return (
    ['REQUESTED', 'CONFIRMED'].includes(status) &&
    new Date(scheduledAt).getTime() - now >= 24 * 60 * 60 * 1000
  );
}

export function canRoleUpdateStatus(
  role: string,
  status: AppointmentStatus,
  nextStatus: 'CONFIRMED' | 'COMPLETED',
) {
  return (
    (role === 'DOCTOR' || role === 'ADMIN') &&
    (nextStatus === 'CONFIRMED' ? status === 'REQUESTED' : status === 'CONFIRMED')
  );
}

export function bookingVariables(objective: string, doctorId: string, slot: string) {
  return { objective, doctorId, scheduledAt: new Date(slot).toISOString() };
}

export function isNotificationUnread(readAt: string | null) {
  return readAt === null;
}
