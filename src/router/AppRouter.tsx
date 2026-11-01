import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { initialPatients } from '../data-services/patients'
import { AppShell } from '../layouts/AppShell'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import PatientDetailPage from '../pages/patients/PatientDetailPage'
import PatientFormPage from '../pages/patients/PatientFormPage'
import PatientListPage from '../pages/patients/PatientListPage'
import WorkflowView from '../views/workflow/WorkflowView'
import type { Patient } from '../types/patient'

export default function AppRouter() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)

  function savePatient(updatedPatient: Patient) {
    setPatients((current) => {
      const exists = current.some((patient) => patient.id === updatedPatient.id)
      return exists ? current.map((patient) => patient.id === updatedPatient.id ? updatedPatient : patient) : [updatedPatient, ...current]
    })
  }

  return <Routes>
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route element={<AppShell />}>
      <Route index element={<Navigate to="/patients" replace />} />
      <Route path="patients" element={<PatientListPage patients={patients} />} />
      <Route path="patients/new" element={<PatientFormPage patients={patients} onSave={savePatient} />} />
      <Route path="patients/:id/edit" element={<PatientFormPage patients={patients} onSave={savePatient} />} />
      <Route path="patients/:id" element={<PatientDetailPage patients={patients} />} />
      <Route path="workflow" element={<WorkflowView />} />
      <Route path="*" element={<Navigate to="/patients" replace />} />
    </Route>
  </Routes>
}
