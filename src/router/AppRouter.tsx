import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '../layouts/AppShell';
import AppointmentDetailPage from '../pages/appointments/AppointmentDetailPage';
import AppointmentsPage from '../pages/appointments/AppointmentsPage';
import BookAppointmentPage from '../pages/appointments/BookAppointmentPage';
import CalendarPage from '../pages/appointments/CalendarPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DoctorManagementPage from '../pages/doctors/DoctorManagementPage';
import DoctorsPage from '../pages/doctors/DoctorsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import PatientDetailPage from '../pages/patients/PatientDetailPage';
import PatientFormPage from '../pages/patients/PatientFormPage';
import PatientListPage from '../pages/patients/PatientListPage';
import WorkflowView from '../views/workflow/WorkflowView';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/auth/login' element={<LoginPage />} />
      <Route path='/auth/register' element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to='/doctors' replace />} />
        <Route path='doctors' element={<DoctorsPage />} />
        <Route
          path='admin/doctors'
          element={
            <RequireRole roles={['ADMIN']}>
              <DoctorManagementPage />
            </RequireRole>
          }
        />
        <Route path='calendar' element={<CalendarPage />} />
        <Route path='appointments' element={<AppointmentsPage />} />
        <Route
          path='appointments/new'
          element={
            <RequireRole roles={['CUSTOMER']}>
              <BookAppointmentPage />
            </RequireRole>
          }
        />
        <Route path='appointments/:id' element={<AppointmentDetailPage />} />
        <Route path='notifications' element={<NotificationsPage />} />
        <Route
          path='patients'
          element={
            <RequireRole roles={['ADMIN']}>
              <PatientListPage />
            </RequireRole>
          }
        />
        <Route
          path='patients/new'
          element={
            <RequireRole roles={['ADMIN']}>
              <PatientFormPage />
            </RequireRole>
          }
        />
        <Route
          path='patients/:id/edit'
          element={
            <RequireRole roles={['ADMIN']}>
              <PatientFormPage />
            </RequireRole>
          }
        />
        <Route
          path='patients/:id'
          element={
            <RequireRole roles={['ADMIN']}>
              <PatientDetailPage />
            </RequireRole>
          }
        />
        <Route
          path='workflow'
          element={
            <RequireRole roles={['ADMIN']}>
              <WorkflowView />
            </RequireRole>
          }
        />
        <Route path='*' element={<Navigate to='/doctors' replace />} />
      </Route>
    </Routes>
  );
}
