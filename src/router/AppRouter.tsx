import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../data-services/auth-context';
import { AppShell } from '../layouts/AppShell';
import AppointmentsPage from '../pages/appointments/AppointmentsPage';
import CalendarPage from '../pages/appointments/CalendarPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DoctorManagementPage from '../pages/doctors/DoctorManagementPage';
import DoctorsPage from '../pages/doctors/DoctorsPage';
import PatientDetailPage from '../pages/patients/PatientDetailPage';
import PatientFormPage from '../pages/patients/PatientFormPage';
import PatientListPage from '../pages/patients/PatientListPage';
import UsersManagementPage from '../pages/users/UsersManagementPage';
import DoctorScheduleView from '../views/doctors/DoctorScheduleView';
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
        <Route index element={<HomeRedirect />} />
        <Route
          path='doctors'
          element={
            <RequireRole roles={['ADMIN', 'CUSTOMER']}>
              <DoctorsPage />
            </RequireRole>
          }
        />
        <Route
          path='my-schedule'
          element={
            <RequireRole roles={['DOCTOR']}>
              <DoctorScheduleView />
            </RequireRole>
          }
        />
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
              <AppointmentsPage />
            </RequireRole>
          }
        />
        <Route path='appointments/:id' element={<AppointmentsPage />} />
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
        <Route
          path='admin/users'
          element={
            <RequireRole roles={['ADMIN']}>
              <UsersManagementPage />
            </RequireRole>
          }
        />
        <Route path='*' element={<Navigate to='/doctors' replace />} />
      </Route>
    </Routes>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'DOCTOR' ? '/my-schedule' : '/doctors'} replace />;
}
