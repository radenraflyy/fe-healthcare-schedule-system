import PatientDetailView from '../../views/patients/PatientDetailView'
import type { Patient } from '../../types/patient'

export default function PatientDetailPage({ patients }: { patients: Patient[] }) {
  return <PatientDetailView patients={patients} />
}
