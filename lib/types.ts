// Domain types for the DEC Fleet & Workforce platform.

export type Status = 'ready' | 'due_soon' | 'blocked' | 'verification_pending';

export type Role =
  | 'owner'
  | 'company_manager'
  | 'controller'
  | 'driver_pa'
  | 'mechanic'
  | 'hr_vetting'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
  depotId?: string;
  initials: string;
}

export interface Company {
  id: string;
  legalName: string;
  tradingName: string;
  archived: boolean;
  createdAt: string;
}

export interface Depot {
  id: string;
  companyId: string;
  name: string;
  town: string;
}

export type VehicleType = 'saloonsaloon' | 'executive_saloonsaloon' | 'mpv' | 'wav' | 'minibus';

export interface Vehicle {
  id: string;
  companyId: string;
  depotId: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: Status;
  statusReason: string;
  statusSource: string;
  lastVerifiedAt: string;
  reviewer: string;
  // MOT — annual
  motExpiry: string;       // ISO date (UTC)
  motLastPassed?: string;
  // Council six-month check — independent of MOT
  councilSixMonthDue: string;
  councilLastChecked?: string;
  // servicing
  nextServiceDate?: string;
  nextServiceMileage?: number;
  currentMileage: number;
  serviceIntervalMiles: number;
  serviceIntervalMonths: number;
  // assignment
  assignedDriverId?: string;
  assignedPaId?: string;
  offRoad: boolean;
  // docs
  insuranceExpiry?: string;
  pcoLicenceExpiry?: string;
}

export interface ChecklistTemplate {
  id: string;
  versionId: string;
  name: string;
  publishedAt: string;
  authorId: string;
  authorName: string;
  scope: { companies?: string[]; councils?: string[]; vehicleTypes?: VehicleType[]; vehicleIds?: string[] };
  sections: ChecklistSection[];
  active: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export type ItemType = 'pass_fail_na' | 'yes_no' | 'text' | 'number' | 'select' | 'photo' | 'note';

export interface ChecklistItem {
  id: string;
  label: string;
  type: ItemType;
  required: boolean;
  mandatoryPhoto?: boolean;
  mandatoryNote?: boolean;
  criticalFailure?: boolean;
  options?: string[];
}

export interface CheckSubmission {
  id: string;
  vehicleId: string;
  driverId: string;
  templateVersionId: string;
  submittedAt: string;        // driver completion time
  receivedAt: string;         // server receipt time
  offline: boolean;
  startMileage: number;
  endMileage: number;
  implausibleMileage: boolean;
  locked: boolean;
  passed: boolean;
  criticalFailures: number;
  defectIds: string[];
  corrections: { at: string; by: string; note: string }[];
}

export type DefectStatus =
  | 'new' | 'triaged' | 'assigned' | 'booked' | 'repair_complete' | 'verified' | 'closed'
  | 'monitored' | 'rejected_duplicate' | 'reopened';

export type DefectSeverity = 'critical' | 'major' | 'minor';

export interface Defect {
  id: string;
  ref: string;
  vehicleId: string;
  reportedById: string;
  reportedAt: string;
  severity: DefectSeverity;
  status: DefectStatus;
  title: string;
  description: string;
  component: string;
  checkSubmissionId?: string;
  assignedTo?: string;
  bookedFor?: string;
  workshopJobId?: string;
  releasedToService: boolean;
  releasedBy?: string;
  releasedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  events: DefectEvent[];
  blocksAllocation: boolean;
}

export interface DefectEvent {
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface Person {
  id: string;
  companyId: string;
  depotId?: string;
  name: string;
  initials: string;
  roles: ('driver' | 'passenger_assistant' | 'dual')[];
  // driving clearance
  drivingClearance: Status;
  drivingClearanceReason: string;
  paClearance: Status;
  paClearanceReason: string;
  specialistClearance: Status;
  // licence
  drivingLicenceNumber?: string;
  licenceExpiry?: string;
  licenceCheckLast?: string;
  licenceCheckNext?: string;
  licenceCheckProvider?: string;
  // DBS
  dbsStatus: Status;
  dbsLastReview?: string;
  dbsNextReview?: string;
  dbsId: string;
  // training (PAT/MiDAS etc — no assumed intervals)
  training: TrainingRecord[];
  contact: string;
  // safeguarding
  safeguardingCases: string[];
}

export interface TrainingRecord {
  id: string;
  course: string;
  completedAt: string;
  expiresAt?: string;
  verifier: string;
  verified: boolean;
}

export interface ServiceSchedule {
  id: string;
  vehicleId: string;
  nextDate?: string;
  nextMileage?: number;
  intervalMonths: number;
  intervalMiles: number;
  lastCompletedDate?: string;
  lastCompletedMileage?: number;
}

export interface WorkshopJob {
  id: string;
  ref: string;
  vehicleId: string;
  defectId?: string;
  type: string;
  scheduledFor: string;
  bay: string;
  technician?: string;
  status: 'scheduled' | 'in_progress' | 'complete' | 'cancelled';
  estimatedHours: number;
  cost?: number;
  approvedBy?: string;
}

export interface CostEntry {
  id: string;
  vehicleId: string;
  date: string;
  category: 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'taxation' | 'other';
  description: string;
  vendor: string;
  amountGBP: number;
  linkedInvoiceRef?: string;
  linkedWorkshopJobId?: string;
  approvedBy?: string;
  doubleCountedFlag?: boolean;
}

export interface Incident {
  id: string;
  ref: string;
  vehicleId?: string;
  driverId?: string;
  date: string;
  type: 'accident' | 'damage' | 'near_miss' | 'breakdown' | 'other';
  severity: 'minor' | 'moderate' | 'serious';
  description: string;
  location: string;
  status: 'open' | 'investigating' | 'closed';
  reportedBy: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  state: 'live' | 'not_connected' | 'manual_verification' | 'simulated';
  description: string;
  lastSync?: string;
  notes: string;
}

export interface RuleEntry {
  id: string;
  name: string;
  source: string;
  jurisdiction: string;
  effectiveDate: string;
  reviewer: string;
  nextReviewDate: string;
  status: 'active' | 'needs_validation' | 'draft';
  summary: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  company: string;
  detail?: string;
  restricted: boolean;
}

export interface Notification {
  id: string;
  at: string;
  title: string;
  body: string;
  kind: 'critical' | 'warning' | 'info';
  read: boolean;
  link?: string;
}

export interface GreyFleetEntry {
  id: string;
  driverId: string;
  vehicleRegistration: string;
  makeModel: string;
  insuranceExpiry: string;
  motExpiry: string;
  businessUseConfirmed: boolean;
  lastChecked: string;
  status: Status;
}
