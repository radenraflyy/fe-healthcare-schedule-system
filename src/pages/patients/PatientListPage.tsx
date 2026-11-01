import PatientListView from '../../views/patients/PatientListView'
import type { Patient } from '../../types/patient'

export default function PatientListPage({ patients }: { patients: Patient[] }) {
  return <PatientListView patients={patients} />
}
