import { bookingVariables } from './appointment-rules';
import { graphqlRequest } from './graphql';
import type { User } from './session';

export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type Doctor = { id: string; name: string; createdAt?: string; updatedAt?: string };
export type CustomerStatus = 'ACTIVE' | 'WAITING' | 'COMPLETED';
export type CustomerProfile = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  address: string | null;
  treatment: string | null;
  status: CustomerStatus | null;
  nextVisit: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CustomerInput = Pick<CustomerProfile, 'name' | 'email'> &
  Partial<Omit<CustomerProfile, 'id' | 'createdAt' | 'updatedAt' | 'name' | 'email'>>;
export type DoctorAvailability = {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};
export type Appointment = {
  id: string;
  objective: string;
  customerId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  durationMinutes: number;
  cancelReason: string | null;
  doctor: Doctor;
  customer: { id: string; name: string; email: string };
};
export type Notification = {
  id: string;
  scheduleId: string | null;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};
export type WorkflowStep = { id: string; title: string; description: string; position: number };
export type WorkflowStepInput = { title: string; description: string };
const USER = 'id email name role createdAt';
const APPOINTMENT =
  'id objective customerId doctorId scheduledAt status durationMinutes cancelReason doctor { id name } customer { id name email }';
const CUSTOMER =
  'id userId name email phone gender birthDate address treatment status nextVisit note createdAt updatedAt';

export const api = {
  async login(email: string, password: string) {
    return graphqlRequest<{
      login: { accessToken: string; tokenType: string; expiresIn: number; user: User };
    }>(
      `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { accessToken tokenType expiresIn user { ${USER} } } }`,
      { email, password },
    );
  },
  async register(email: string, password: string, name: string) {
    return graphqlRequest<{ register: User }>(
      `mutation Register($email: String!, $password: String!, $name: String) { register(email: $email, password: $password, name: $name) { ${USER} } }`,
      { email, password, name },
    );
  },
  async validateToken(token: string) {
    return graphqlRequest<{ validateToken: User }>(
      `query ValidateToken($token: String!) { validateToken(token: $token) { ${USER} } }`,
      { token },
    );
  },
  async doctors() {
    return graphqlRequest<{ doctors: Page<Doctor> }>(
      'query Doctors($page: Int!, $limit: Int!) { doctors(page: $page, limit: $limit) { items { id name } page limit total totalPages } }',
      { page: 1, limit: 100 },
    );
  },
  async doctor(id: string) {
    return graphqlRequest<{ doctor: Doctor }>(
      'query Doctor($id: ID!) { doctor(id: $id) { id name createdAt updatedAt } }',
      { id },
    );
  },
  async createDoctor(name: string, userId?: string | null) {
    return graphqlRequest<{ createDoctor: Doctor }>(
      'mutation CreateDoctor($name: String!, $userId: ID) { createDoctor(name: $name, userId: $userId) { id name createdAt updatedAt } }',
      { name, userId },
    );
  },
  async updateDoctor(id: string, name: string, userId?: string | null) {
    return graphqlRequest<{ updateDoctor: Doctor }>(
      'mutation UpdateDoctor($id: ID!, $name: String!, $userId: ID) { updateDoctor(id: $id, name: $name, userId: $userId) { id name createdAt updatedAt } }',
      { id, name, userId },
    );
  },
  async deleteDoctor(id: string) {
    return graphqlRequest<{ deleteDoctor: boolean }>(
      'mutation DeleteDoctor($id: ID!) { deleteDoctor(id: $id) }',
      { id },
    );
  },
  async doctorAvailabilities(doctorId: string) {
    return graphqlRequest<{ doctorAvailabilities: DoctorAvailability[] }>(
      'query DoctorAvailabilities($doctorId: ID!) { doctorAvailabilities(doctorId: $doctorId) { id doctorId dayOfWeek startTime endTime slotMinutes } }',
      { doctorId },
    );
  },
  async setDoctorAvailability(input: Omit<DoctorAvailability, 'id'>) {
    return graphqlRequest<{ setDoctorAvailability: DoctorAvailability }>(
      'mutation SetDoctorAvailability($doctorId: ID!, $dayOfWeek: Int!, $startTime: String!, $endTime: String!, $slotMinutes: Int!) { setDoctorAvailability(doctorId: $doctorId, dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime, slotMinutes: $slotMinutes) { id doctorId dayOfWeek startTime endTime slotMinutes } }',
      input,
    );
  },
  async deleteDoctorAvailability(id: string) {
    return graphqlRequest<{ deleteDoctorAvailability: boolean }>(
      'mutation DeleteDoctorAvailability($id: ID!) { deleteDoctorAvailability(id: $id) }',
      { id },
    );
  },
  async setUserRole(userId: string, role: 'ADMIN' | 'DOCTOR' | 'CUSTOMER') {
    return graphqlRequest<{ setUserRole: User }>(
      'mutation SetUserRole($userId: ID!, $role: UserRole!) { setUserRole(userId: $userId, role: $role) { id email name role createdAt } }',
      { userId, role },
    );
  },
  async scheduleHealth() {
    return graphqlRequest<{ scheduleHealth: string }>('query ScheduleHealth { scheduleHealth }');
  },
  async customers(page = 1, limit = 10) {
    return graphqlRequest<{ customers: Page<CustomerProfile> }>(
      `query Customers($page: Int!, $limit: Int!) { customers(page: $page, limit: $limit) { items { ${CUSTOMER} } page limit total totalPages } }`,
      { page, limit },
    );
  },
  async searchCustomers(search: string) {
    const first = await this.customers(1, 100);
    const pages =
      first.customers.totalPages > 1
        ? await Promise.all(
            Array.from({ length: first.customers.totalPages - 1 }, (_, index) =>
              this.customers(index + 2, 100),
            ),
          )
        : [];
    const all = [...first.customers.items, ...pages.flatMap((page) => page.customers.items)];
    const normalized = search.trim().toLowerCase();
    return all.filter((customer) =>
      [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.treatment,
        customer.status,
      ].some((value) => value?.toLowerCase().includes(normalized)),
    );
  },
  async customer(id: string) {
    return graphqlRequest<{ customer: CustomerProfile }>(
      `query Customer($id: ID!) { customer(id: $id) { ${CUSTOMER} } }`,
      { id },
    );
  },
  async createCustomer(input: CustomerInput) {
    return graphqlRequest<{ createCustomer: CustomerProfile }>(
      `mutation CreateCustomer($name: String!, $email: String!, $userId: ID, $phone: String, $gender: String, $birthDate: DateTime, $address: String, $treatment: String, $status: CustomerStatus, $nextVisit: DateTime, $note: String) { createCustomer(name: $name, email: $email, userId: $userId, phone: $phone, gender: $gender, birthDate: $birthDate, address: $address, treatment: $treatment, status: $status, nextVisit: $nextVisit, note: $note) { ${CUSTOMER} } }`,
      {
        ...input,
        birthDate: input.birthDate ? new Date(input.birthDate).toISOString() : null,
        nextVisit: input.nextVisit ? new Date(input.nextVisit).toISOString() : null,
      },
    );
  },
  async updateCustomer(id: string, input: CustomerInput) {
    return graphqlRequest<{ updateCustomer: CustomerProfile }>(
      `mutation UpdateCustomer($id: ID!, $name: String, $email: String, $userId: ID, $phone: String, $gender: String, $birthDate: DateTime, $address: String, $treatment: String, $status: CustomerStatus, $nextVisit: DateTime, $note: String) { updateCustomer(id: $id, name: $name, email: $email, userId: $userId, phone: $phone, gender: $gender, birthDate: $birthDate, address: $address, treatment: $treatment, status: $status, nextVisit: $nextVisit, note: $note) { ${CUSTOMER} } }`,
      {
        id,
        ...input,
        birthDate: input.birthDate ? new Date(input.birthDate).toISOString() : null,
        nextVisit: input.nextVisit ? new Date(input.nextVisit).toISOString() : null,
      },
    );
  },
  async deleteCustomer(id: string) {
    return graphqlRequest<{ deleteCustomer: boolean }>(
      'mutation DeleteCustomer($id: ID!) { deleteCustomer(id: $id) }',
      { id },
    );
  },
  async slots(doctorId: string, date: string) {
    return graphqlRequest<{ availableSlots: string[] }>(
      'query AvailableSlots($doctorId: ID!, $date: DateTime!) { availableSlots(doctorId: $doctorId, date: $date) }',
      { doctorId, date: `${date}T00:00:00.000Z` },
    );
  },
  async schedules(
    options: {
      page?: number;
      limit?: number;
      customerId?: string;
      from?: string;
      to?: string;
    } = {},
  ) {
    return graphqlRequest<{ schedules: Page<Appointment> }>(
      `query Schedules($page: Int!, $limit: Int!, $customerId: ID, $from: DateTime, $to: DateTime) { schedules(page: $page, limit: $limit, customerId: $customerId, from: $from, to: $to) { items { ${APPOINTMENT} } page limit total totalPages } }`,
      {
        page: options.page ?? 1,
        limit: options.limit ?? 100,
        customerId: options.customerId,
        from: options.from,
        to: options.to,
      },
    );
  },
  async schedule(id: string) {
    return graphqlRequest<{ schedule: Appointment }>(
      `query Schedule($id: ID!) { schedule(id: $id) { ${APPOINTMENT} } }`,
      { id },
    );
  },
  async deleteSchedule(id: string) {
    return graphqlRequest<{ deleteSchedule: boolean }>(
      'mutation DeleteSchedule($id: ID!) { deleteSchedule(id: $id) }',
      { id },
    );
  },
  async createSchedule(objective: string, doctorId: string, scheduledAt: string) {
    return graphqlRequest<{ createSchedule: Appointment }>(
      `mutation CreateSchedule($objective: String!, $doctorId: ID!, $scheduledAt: DateTime!) { createSchedule(objective: $objective, doctorId: $doctorId, scheduledAt: $scheduledAt) { ${APPOINTMENT} } }`,
      bookingVariables(objective, doctorId, scheduledAt),
    );
  },
  async updateStatus(
    id: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
    cancelReason?: string,
  ) {
    return graphqlRequest<{ updateScheduleStatus: Appointment }>(
      `mutation UpdateScheduleStatus($id: ID!, $status: ScheduleStatus!, $cancelReason: String) { updateScheduleStatus(id: $id, status: $status, cancelReason: $cancelReason) { ${APPOINTMENT} } }`,
      { id, status, cancelReason },
    );
  },
  async reschedule(id: string, scheduledAt: string) {
    return graphqlRequest<{ reschedule: Appointment }>(
      `mutation Reschedule($id: ID!, $scheduledAt: DateTime!) { reschedule(id: $id, scheduledAt: $scheduledAt) { ${APPOINTMENT} } }`,
      { id, scheduledAt: new Date(scheduledAt).toISOString() },
    );
  },
  async notifications() {
    return graphqlRequest<{ notifications: Page<Notification> }>(
      'query Notifications($page: Int!, $limit: Int!) { notifications(page: $page, limit: $limit) { items { id scheduleId title message createdAt readAt } page limit total totalPages } }',
      { page: 1, limit: 50 },
    );
  },
  async markRead(id: string) {
    return graphqlRequest<{ markNotificationRead: boolean }>(
      'mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) }',
      { id },
    );
  },
  async workflowSteps() {
    return graphqlRequest<{ workflowSteps: WorkflowStep[] }>(
      'query WorkflowSteps { workflowSteps { id title description position } }',
    );
  },
  async saveWorkflowSteps(steps: WorkflowStepInput[]) {
    return graphqlRequest<{ saveWorkflowSteps: WorkflowStep[] }>(
      'mutation SaveWorkflowSteps($steps: [WorkflowStepInput!]!) { saveWorkflowSteps(steps: $steps) { id title description position } }',
      { steps },
    );
  },
};
