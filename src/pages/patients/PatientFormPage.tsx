import PatientFormView from '../../views/patients/PatientFormView'
import type { Patient } from '../../types/patient'

type PatientFormPageProps = {
  patients: Patient[]
  onSave: (patient: Patient) => void
}

export default function PatientFormPage({ patients, onSave }: PatientFormPageProps) {
  return <PatientFormView patients={patients} onSave={onSave} />
}
