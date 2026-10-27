import type {
  Company, Depot, Vehicle, Person, ChecklistTemplate, CheckSubmission,
  Defect, ServiceSchedule, WorkshopJob, CostEntry, Incident, Integration,
  RuleEntry, AuditEntry, Notification, GreyFleetEntry,
} from './types';

// "today" for the demo = 2026-10-27. All due dates seeded relative to this.

export const TODAY = '2026-10-27T00:00:00Z';

export const companies: Company[] = [
  { id: 'c-dec', legalName: 'Dunstable Executive Cars Ltd', tradingName: 'Dunstable Executive Cars', archived: false, createdAt: '2019-03-01T00:00:00Z' },
  { id: 'c-schoolrun', legalName: 'DEC School Transport Ltd', tradingName: 'DEC School Transport', archived: false, createdAt: '2022-08-15T00:00:00Z' },
  { id: 'c-archive', legalName: 'Bedfordshire Chauffeur Services Ltd', tradingName: 'Bedfordshire Chauffeurs', archived: true, createdAt: '2018-01-01T00:00:00Z' },
];

export const depots: Depot[] = [
  { id: 'd-dunstable', companyId: 'c-dec', name: 'Dunstable Depot', town: 'Dunstable' },
  { id: 'd-luton', companyId: 'c-dec', name: 'Luton Depot', town: 'Luton' },
  { id: 'd-leighton', companyId: 'c-schoolrun', name: 'Leighton Buzzard Depot', town: 'Leighton Buzzard' },
];

const v = (
  id: string, companyId: string, depotId: string, registration: string,
  make: string, model: string, year: number, type: Vehicle['type'],
  status: Vehicle['status'], statusReason: string, statusSource: string,
  lastVerifiedAt: string, reviewer: string,
  motExpiry: string, councilSixMonthDue: string,
  currentMileage: number, serviceIntervalMiles: number, serviceIntervalMonths: number,
  nextServiceDate?: string, nextServiceMileage?: number,
  assignedDriverId?: string, assignedPaId?: string,
  motLastPassed?: string, councilLastChecked?: string,
  insuranceExpiry?: string, pcoLicenceExpiry?: string, offRoad?: boolean,
): Vehicle => ({
  id, companyId, depotId, registration, make, model, year, type,
  status, statusReason, statusSource, lastVerifiedAt, reviewer,
  motExpiry, motLastPassed, councilSixMonthDue, councilLastChecked,
  nextServiceDate, nextServiceMileage, currentMileage, serviceIntervalMiles, serviceIntervalMonths,
  assignedDriverId, assignedPaId, offRoad: offRoad ?? false,
  insuranceExpiry, pcoLicenceExpiry,
});

export const vehicles: Vehicle[] = [
  // Dunstable depot
  v('veh-1','c-dec','d-dunstable','LK71 ABX','Mercedes','E-Class',2021,'executive_saloonsaloon','ready','All checks current','MOT history + council check','2026-10-20T09:00:00Z','Sarah Whitfield','2027-06-15','2027-04-15',48230,18000,12,'2027-04-15',66000,'drv-1',undefined,'2026-06-15','2026-10-15','2027-01-20','2027-03-01'),
  v('veh-2','c-dec','d-dunstable','MX22 CDF','Toyota','Prius',2022,'saloonsaloon','due_soon','MOT due in 22 days','MOT history','2026-10-18T09:00:00Z','James Okoro','2026-11-18','2026-11-18',31450,15000,12,'2026-12-01',46000,'drv-2',undefined,'2025-11-18','2026-05-18','2027-02-10','2027-01-15'),
  v('veh-3','c-dec','d-dunstable','WT65 XPL','Ford','Galaxy',2016,'mpv','blocked','Expired MOT (overdue 14 days)','MOT history','2026-10-13T09:00:00Z','James Okoro','2026-10-13','2026-10-13',98700,12000,6,undefined,undefined,undefined,undefined,'2025-10-13','2026-04-13','2026-09-30','2026-08-01'),
  v('veh-4','c-dec','d-dunstable','BD55 KLM','Vauxhall','Vivaro',2015,'minibus','blocked','Critical defect — front brake pads below limit; awaiting verification','Defect register','2026-10-26T14:00:00Z','Tom Bridger','2027-01-09','2026-12-09',126400,15000,6,'2026-11-20',130000,'drv-3','pa-1','2026-01-09','2026-06-09','2026-11-15','2026-05-20'),
  v('veh-5','c-dec','d-dunstable','PL20 TUV','Mercedes','Vito WAV',2020,'wav','verification_pending','Council six-month check awaiting verification','Council portal','2026-10-25T16:00:00Z','Sarah Whitfield','2027-04-30','2026-10-30',67800,18000,12,'2027-04-30',86000,'drv-4','pa-2','2026-04-30','2026-04-30','2027-03-12','2027-02-28'),
  v('veh-6','c-dec','d-dunstable','YE24 GHI','Skoda','Octavia',2024,'saloonsaloon','ready','All current','DVSA','2026-10-22T09:00:00Z','James Okoro','2028-04-24','2027-04-24',8900,20000,24,'2028-04-24',28900,'drv-5',undefined,'2026-04-24','2026-10-24','2027-09-01','2027-08-15'),
  v('veh-7','c-dec','d-dunstable','AH19 RST','Volkswagen','Transporter',2019,'mpv','due_soon','Service overdue by mileage','Service schedule','2026-10-21T09:00:00Z','Tom Bridger','2027-03-19','2027-01-19',74200,15000,12,undefined,73000,'drv-6',undefined,'2026-03-19','2026-07-19','2027-05-10','2027-01-30'),
  v('veh-8','c-dec','d-dunstable','FG62 NOP','BMW','5 Series',2022,'executive_saloonsaloon','ready','All current','MOT history','2026-10-19T09:00:00Z','Sarah Whitfield','2027-05-22','2027-03-22',22100,18000,12,'2027-05-22',40000,'drv-7',undefined,'2026-05-22','2026-09-22','2027-04-15','2027-02-10'),
  // Luton depot
  v('veh-9','c-dec','d-luton','LU51 QWE','Toyota','Prius',2021,'saloonsaloon','ready','All current','DVSA','2026-10-20T09:00:00Z','James Okoro','2027-07-01','2027-05-01',41200,15000,12,'2027-05-01',56000,'drv-8',undefined,'2026-07-01','2026-11-01','2027-03-20','2027-02-01'),
  v('veh-10','c-dec','d-luton','RT77 VBN','Ford','Transit WAV',2017,'wav','due_soon','Insurance due in 18 days','Insurance record','2026-10-18T09:00:00Z','James Okoro','2027-02-12','2026-12-12',89300,12000,6,'2026-12-12',90000,'drv-9','pa-3','2026-02-12','2026-06-12','2026-11-14','2026-10-20'),
  v('veh-11','c-dec','d-luton','ZX03 ASD','Mercedes','E-Class',2023,'executive_saloonsaloon','ready','All current','MOT history','2026-10-22T09:00:00Z','Sarah Whitfield','2028-06-10','2027-06-10',15600,18000,12,'2027-06-10',33600,'drv-10',undefined,'2026-06-10','2026-10-10','2027-07-01','2027-05-15'),
  v('veh-12','c-dec','d-luton','QW88 RTY','Vauxhall','Combo WAV',2018,'wav','blocked','Off-road: accident damage pending repair','Incident log','2026-10-24T11:00:00Z','James Okoro','2027-01-28','2026-11-28',78000,12000,6,undefined,undefined,undefined,undefined,'2026-01-28','2026-05-28',undefined,undefined,true),
  v('veh-13','c-dec','d-luton','GH45 JKL','Toyota','Corolla',2020,'saloonsaloon','ready','All current','DVSA','2026-10-21T09:00:00Z','James Okoro','2027-08-15','2027-06-15',45600,15000,12,'2027-06-15',60000,'drv-11',undefined,'2026-08-15','2026-02-15','2027-01-25','2026-12-20'),
  v('veh-14','c-dec','d-luton','MN09 OPQ','Ford','Galaxy',2019,'mpv','verification_pending','DBS clearance pending for assigned driver','HR system','2026-10-26T10:00:00Z','Anita Sharma','2027-04-20','2027-02-20',52300,15000,12,'2027-02-20',60000,'drv-12','pa-4','2026-04-20','2026-10-20','2027-03-30','2027-01-10'),
  // School transport (sub-company) — Leighton Buzzard
  v('veh-15','c-schoolrun','d-leighton','SR12 KID','Volkswagen','Transporter',2012,'minibus','due_soon','MOT due in 9 days','MOT history','2026-10-20T09:00:00Z','James Okoro','2026-11-05','2026-11-05',142800,12000,6,'2026-11-20',150000,'drv-13','pa-5','2025-11-05','2026-05-05','2026-12-01','2026-10-15'),
  v('veh-16','c-schoolrun','d-leighton','SR34 SCH','Ford','Transit Minibus',2014,'minibus','ready','All current','Council portal','2026-10-22T09:00:00Z','James Okoro','2027-05-18','2027-01-18',118400,12000,6,'2027-01-18',130000,'drv-14','pa-6','2026-05-18','2026-07-18','2027-02-20','2026-12-01'),
  v('veh-17','c-schoolrun','d-leighton','SR78 BUS','Mercedes','Sprinter',2018,'minibus','blocked','Expired MOT (overdue 3 days)','MOT history','2026-10-24T09:00:00Z','James Okoro','2026-10-24','2026-10-24',95600,15000,6,undefined,undefined,'drv-15','pa-7','2025-10-24','2026-04-24','2026-11-30','2026-09-10'),
  v('veh-18','c-schoolrun','d-leighton','SR56 WAV','Vauxhall','Vivaro WAV',2019,'wav','ready','All current','Council portal','2026-10-23T09:00:00Z','Sarah Whitfield','2027-06-28','2027-02-28',48200,18000,12,'2027-02-28',66000,'drv-16','pa-8','2026-06-28','2026-08-28','2027-04-01','2027-01-20'),
  v('veh-19','c-schoolrun','d-leighton','SR90 MPV','Ford','Galaxy',2021,'mpv','due_soon','Service due in 20 days','Service schedule','2026-10-21T09:00:00Z','Tom Bridger','2027-04-10','2027-02-10',38900,15000,12,'2026-11-16',40000,'drv-17',undefined,'2026-04-10','2026-10-10','2027-03-15','2027-01-05'),
  v('veh-20','c-schoolrun','d-leighton','SR23 VAN','Volkswagen','Transporter',2016,'mpv','verification_pending','Insurance document awaiting verification','Insurance record','2026-10-25T15:00:00Z','James Okoro','2027-01-30','2026-12-30',87000,15000,12,undefined,90000,undefined,undefined,'2026-01-30','2026-06-30','2026-11-20','2026-10-30'),
  // Extra edge cases
  v('veh-21','c-dec','d-dunstable','EX99 LUX','BMW','7 Series',2023,'executive_saloonsaloon','ready','All current','MOT history','2026-10-23T09:00:00Z','Sarah Whitfield','2028-06-30','2027-06-30',11200,18000,24,'2028-06-30',29200,'drv-18',undefined,'2026-06-30','2026-10-30','2027-08-01','2027-06-15'),
  v('veh-22','c-dec','d-luton','OF33 OLD','Vauxhall','Zafira',2013,'mpv','blocked','Off-road: engine failure','Workshop','2026-10-15T09:00:00Z','Tom Bridger','2026-09-05','2026-09-05',156800,12000,6,undefined,undefined,undefined,undefined,'2025-09-05','2026-03-05',undefined,undefined,true),
  v('veh-23','c-dec','d-dunstable','NW44 NEW','Tesla','Model 3',2024,'executive_saloonsaloon','ready','All current (EV — exempt MOT first 3y)','DVSA','2026-10-24T09:00:00Z','James Okoro','2028-04-10','2027-04-10',6700,25000,24,'2028-04-10',31700,'drv-19',undefined,undefined,'2026-10-10','2027-09-01','2027-07-20'),
  v('veh-24','c-schoolrun','d-leighton','SR67 NEW','Ford','Transit',2024,'minibus','ready','All current','Council portal','2026-10-22T09:00:00Z','James Okoro','2028-03-15','2027-03-15',9100,20000,24,'2028-03-15',29100,'drv-20',undefined,'2026-03-15','2026-09-15','2027-04-10','2027-02-01'),
  v('veh-25','c-dec','d-dunstable','SP02 ARE','Volkswagen','Caddy WAV',2012,'wav','due_soon','MOT due in 5 days; council check due in 12 days','MOT history + council','2026-10-26T09:00:00Z','James Okoro','2026-11-01','2026-11-08',109500,12000,6,'2026-11-20',114000,'drv-21',undefined,'2025-11-01','2026-05-08','2026-12-15','2026-10-25'),
];

// People — 30 staff with edge cases
function p(
  id: string, companyId: string, depotId: string, name: string,
  roles: Person['roles'], drivingClearance: Person['drivingClearance'], drivingClearanceReason: string,
  paClearance: Person['paClearance'], paClearanceReason: string,
  licenceExpiry?: string, licenceCheckLast?: string, licenceCheckNext?: string, licenceCheckProvider?: string,
  dbsStatus: Person['dbsStatus'] = 'ready', dbsLastReview?: string, dbsNextReview?: string,
  specialistClearance: Person['specialistClearance'] = 'ready',
  drivingLicenceNumber?: string,
): Person {
  return {
    id, companyId, depotId, name, initials: initials(name), roles,
    drivingClearance, drivingClearanceReason, paClearance, paClearanceReason, specialistClearance,
    licenceExpiry, licenceCheckLast, licenceCheckNext, licenceCheckProvider,
    dbsStatus, dbsLastReview, dbsNextReview, dbsId: `DBS-${id.toUpperCase()}`,
    training: [], contact: '07700 900' + id.slice(-3),
    safeguardingCases: [],
    drivingLicenceNumber,
  };
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export const people: Person[] = [
  p('drv-1','c-dec','d-dunstable','Michael Carter',['driver'],'ready','Licence and DBS current','verification_pending','PA clearance not assessed','2028-06-01','2026-09-01','2026-12-01','DVLA ADD','ready','2026-08-01','2027-08-01','ready','CART991023MI99X'),
  p('drv-2','c-dec','d-dunstable','Linda Foster',['driver'],'ready','All current','verification_pending','Not assessed','2027-11-15','2026-10-01','2027-01-01','DVLA ADD','ready','2026-07-01','2027-07-01','ready','FOST851104LF55Z'),
  p('drv-3','c-dec','d-dunstable','Robert Khan',['driver'],'blocked','Licence expired 3 days ago','verification_pending','Not assessed','2026-10-24','2026-04-24','2026-10-24','DVLA ADD','ready','2026-06-01','2027-06-01','ready','KHAN701207RK11A'),
  p('drv-4','c-dec','d-dunstable','Emma Walsh',['dual'],'ready','All current','ready','PA clearance verified','2028-01-20','2026-09-15','2026-12-15','DVLA ADD','ready','2026-09-01','2027-09-01','ready','WALS902209EM22B'),
  p('drv-5','c-dec','d-dunstable','David Hughes',['driver'],'ready','All current','verification_pending','Not assessed','2028-03-30','2026-09-20','2026-12-20','DVLA ADD','ready','2026-05-01','2027-05-01','ready','HUGH881215DH33C'),
  p('drv-6','c-dec','d-dunstable','Sandra Price',['driver'],'due_soon','Licence check due in 12 days','verification_pending','Not assessed','2027-02-10','2026-05-10','2026-11-08','DVLA ADD','due_soon','2026-04-01','2026-11-01','ready','PRIC920417SP44D'),
  p('drv-7','c-dec','d-dunstable','Nigel Brooks',['driver'],'ready','All current','verification_pending','Not assessed','2028-07-12','2026-10-02','2027-01-02','DVLA ADD','ready','2026-08-01','2027-08-01','ready','BROO860108NB55E'),
  p('drv-8','c-dec','d-luton','Fatima Ali',['driver'],'ready','All current','verification_pending','Not assessed','2028-05-01','2026-09-25','2026-12-25','DVLA ADD','ready','2026-07-01','2027-07-01','ready','ALI930315FA66F'),
  p('drv-9','c-dec','d-luton','Gareth Owen',['dual'],'ready','All current','ready','All current','2028-02-28','2026-08-28','2026-11-28','DVLA ADD','ready','2026-06-01','2027-06-01','ready','OWEN890712GO77G'),
  p('drv-10','c-dec','d-luton','Helen Clarke',['driver'],'ready','All current','verification_pending','Not assessed','2029-01-10','2026-10-05','2027-01-05','DVLA ADD','ready','2026-09-01','2027-09-01','ready','CLAR910120HC88H'),
  p('drv-11','c-dec','d-luton','Imran Sheikh',['driver'],'ready','All current','verification_pending','Not assessed','2027-12-20','2026-09-18','2026-12-18','DVLA ADD','ready','2026-05-01','2027-05-01','ready','SHEI880419IS99I'),
  p('drv-12','c-dec','d-luton','Joanna Reed',['driver'],'verification_pending','DBS clearance pending review','verification_pending','Not assessed','2028-04-15','2026-10-15','2027-01-15','DVLA ADD','verification_pending','2026-03-01','2026-10-25','ready','REED940502JR10J'),
  p('drv-13','c-schoolrun','d-leighton','Kevin Wright',['dual'],'ready','All current','ready','PA clearance verified','2027-11-30','2026-09-10','2026-12-10','DVLA ADD','ready','2026-08-01','2027-08-01','ready','WRIG850715KW12K'),
  p('drv-14','c-schoolrun','d-leighton','Maria Santos',['dual'],'ready','All current','ready','All current','2028-08-22','2026-09-22','2026-12-22','DVLA ADD','ready','2026-07-01','2027-07-01','ready','SANT920703MS23L'),
  p('drv-15','c-schoolrun','d-leighton','Philip Day',['driver'],'blocked','Licence revoked — pending investigation','verification_pending','Not assessed','2026-06-01','2026-06-01','2026-10-15','DVLA ADD','blocked','2025-12-01','2026-12-01','blocked','DAY870218PD34M'),
  p('drv-16','c-schoolrun','d-leighton','Carol Webb',['dual'],'ready','All current','ready','All current','2028-09-05','2026-09-05','2026-12-05','DVLA ADD','ready','2026-08-01','2027-08-01','ready','WEBB890414CW45N'),
  p('drv-17','c-schoolrun','d-leighton','Steven Holt',['driver'],'due_soon','DBS review due in 8 days','verification_pending','Not assessed','2028-02-10','2026-09-30','2026-12-30','DVLA ADD','due_soon','2025-11-04','2026-11-04','ready','HOLT871018SH56O'),
  p('drv-18','c-dec','d-dunstable','Olivia Grant',['driver'],'ready','All current','verification_pending','Not assessed','2028-11-20','2026-10-03','2027-01-03','DVLA ADD','ready','2026-09-01','2027-09-01','ready','GRAN930120OG67P'),
  p('drv-19','c-dec','d-dunstable','Daniel Foster',['driver'],'ready','All current','verification_pending','Not assessed','2028-12-01','2026-10-08','2027-01-08','DVLA ADD','ready','2026-08-01','2027-08-01','ready','FOST891201DF78Q'),
  p('drv-20','c-dec','d-dunstable','Rebecca Lane',['driver'],'ready','All current','verification_pending','Not assessed','2029-02-14','2026-10-10','2027-01-10','DVLA ADD','ready','2026-07-01','2027-07-01','ready','LANE950214RL89R'),
  p('drv-21','c-dec','d-dunstable','Andrew West',['driver'],'ready','All current','verification_pending','Not assessed','2027-10-30','2026-09-12','2026-12-12','DVLA ADD','ready','2026-06-01','2027-06-01','ready','WEST840330AW90S'),
  // PAs only (no licence required)
  p('pa-1','c-dec','d-dunstable','Jane Tomlinson',['passenger_assistant'],'verification_pending','N/A — PA role only','ready','All current',undefined,undefined,undefined,undefined,'ready','2026-08-01','2027-08-01','ready'),
  p('pa-2','c-dec','d-dunstable','Sue Hadley',['passenger_assistant'],'verification_pending','N/A — PA role only','ready','All current',undefined,undefined,undefined,undefined,'ready','2026-07-01','2027-07-01','ready','specialist_wav'),
  p('pa-3','c-dec','d-luton','Pat Whittaker',['passenger_assistant'],'verification_pending','N/A — PA role only','due_soon','DBS review due in 5 days',undefined,undefined,undefined,undefined,'due_soon','2025-11-01','2026-11-01','ready'),
  p('pa-4','c-dec','d-luton','Mohammed Iqbal',['passenger_assistant'],'verification_pending','N/A — PA role only','verification_pending','DBS clearance pending',undefined,undefined,undefined,undefined,'verification_pending','2026-03-01','2026-10-25','ready'),
  p('pa-5','c-schoolrun','d-leighton','Gail Pemberton',['passenger_assistant'],'verification_pending','N/A — PA role only','ready','All current',undefined,undefined,undefined,undefined,'ready','2026-08-01','2027-08-01','ready'),
  p('pa-6','c-schoolrun','d-leighton','Ray Sinclair',['passenger_assistant'],'verification_pending','N/A — PA role only','ready','All current',undefined,undefined,undefined,undefined,'ready','2026-07-01','2027-07-01','ready','specialist_wav'),
  p('pa-7','c-schoolrun','d-leighton','Tara Nichols',['passenger_assistant'],'verification_pending','N/A — PA role only','blocked','Safeguarding case open — suspended',undefined,undefined,undefined,undefined,'blocked','2026-01-01','2027-01-01','blocked'),
  p('pa-8','c-schoolrun','d-leighton','Lee Baxter',['passenger_assistant'],'verification_pending','N/A — PA role only','ready','All current',undefined,undefined,undefined,undefined,'ready','2026-09-01','2027-09-01','ready'),
  p('drv-pa-1','c-dec','d-dunstable','Aisha Patel',['dual'],'ready','All current','ready','All current','2028-05-15','2026-10-01','2027-01-01','DVLA ADD','ready','2026-09-01','2027-09-01','ready','PATE900515AP12T'),
];

// Seed training records
people[0].training = [
  { id: 'tr-1', course: 'PAT (Passenger Assistant Training)', completedAt: '2024-06-01', expiresAt: '2027-06-01', verifier: 'Anita Sharma', verified: true },
];
people[3].training = [
  { id: 'tr-2', course: 'MiDAS Minibus', completedAt: '2024-09-15', expiresAt: '2027-09-15', verifier: 'Anita Sharma', verified: true },
  { id: 'tr-3', course: 'Wheelchair Accessible Vehicle Handling', completedAt: '2025-03-01', expiresAt: undefined, verifier: 'Tom Bridger', verified: true },
];
people[21].training = [
  { id: 'tr-4', course: 'PAT (Passenger Assistant Training)', completedAt: '2024-06-01', expiresAt: '2027-06-01', verifier: 'Anita Sharma', verified: true },
];
people[27].safeguardingCases = ['sg-1'];

export const checklistTemplates: ChecklistTemplate[] = [
  {
    id: 'tpl-1', versionId: 'tpl-1-v3', name: 'Standard Daily Walkaround (v3)',
    publishedAt: '2026-09-01T10:00:00Z', authorId: 'u-owner', authorName: 'Sarah Whitfield',
    scope: { companies: ['c-dec'], vehicleTypes: ['saloonsaloon','executive_saloonsaloon'] },
    active: true,
    sections: [
      { id: 's1', title: 'Exterior', items: [
        { id: 'i1', label: 'All lights working (headlights, indicators, brake)', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i2', label: 'Tyres — tread depth legal and no visible damage', type: 'pass_fail_na', required: true, criticalFailure: true, mandatoryPhoto: true },
        { id: 'i3', label: 'Windscreen — no cracks in driver line of sight', type: 'pass_fail_na', required: true },
        { id: 'i4', label: 'Mirrors intact and adjusted', type: 'pass_fail_na', required: true },
        { id: 'i5', label: 'Bodywork damage photo', type: 'photo', required: false },
      ]},
      { id: 's2', title: 'Under bonnet', items: [
        { id: 'i6', label: 'Oil level', type: 'pass_fail_na', required: true },
        { id: 'i7', label: 'Coolant level', type: 'pass_fail_na', required: true },
        { id: 'i8', label: 'Screen wash level', type: 'pass_fail_na', required: true },
      ]},
      { id: 's3', title: 'Interior', items: [
        { id: 'i9', label: 'Seatbelts all functional', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i10', label: 'Dash warning lights — no faults', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i11', label: 'Cleanliness acceptable', type: 'yes_no', required: false },
        { id: 'i12', label: 'Start mileage', type: 'number', required: true },
        { id: 'i13', label: 'Additional notes', type: 'note', required: false },
      ]},
    ],
  },
  {
    id: 'tpl-1', versionId: 'tpl-1-v2', name: 'Standard Daily Walkaround (v2)',
    publishedAt: '2025-06-01T10:00:00Z', authorId: 'u-owner', authorName: 'Sarah Whitfield',
    scope: { companies: ['c-dec'], vehicleTypes: ['saloonsaloon','executive_saloonsaloon'] },
    active: false,
    sections: [
      { id: 's1', title: 'Exterior', items: [
        { id: 'i1', label: 'Lights working', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i2', label: 'Tyres', type: 'pass_fail_na', required: true, criticalFailure: true },
      ]},
    ],
  },
  {
    id: 'tpl-2', versionId: 'tpl-2-v1', name: 'WAV Daily Walkaround',
    publishedAt: '2026-08-01T10:00:00Z', authorId: 'u-owner', authorName: 'Sarah Whitfield',
    scope: { vehicleTypes: ['wav'] },
    active: true,
    sections: [
      { id: 's1', title: 'WAV-specific', items: [
        { id: 'i1', label: 'Ramp deploys and stows correctly', type: 'pass_fail_na', required: true, criticalFailure: true, mandatoryPhoto: true },
        { id: 'i2', label: 'Wheelchair restraints intact', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i3', label: 'Passenger lift (if fitted) operational', type: 'pass_fail_na', required: true },
      ]},
      { id: 's2', title: 'Standard exterior', items: [
        { id: 'i4', label: 'All lights working', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i5', label: 'Tyres', type: 'pass_fail_na', required: true, criticalFailure: true },
      ]},
    ],
  },
  {
    id: 'tpl-3', versionId: 'tpl-3-v1', name: 'Minibus Daily Walkaround',
    publishedAt: '2026-07-01T10:00:00Z', authorId: 'u-owner', authorName: 'Sarah Whitfield',
    scope: { vehicleTypes: ['minibus'] },
    active: true,
    sections: [
      { id: 's1', title: 'Minibus checks', items: [
        { id: 'i1', label: 'All passenger seatbelts functional', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i2', label: 'Emergency exit operational', type: 'pass_fail_na', required: true, criticalFailure: true },
        { id: 'i3', label: 'First aid kit present and in date', type: 'yes_no', required: true },
      ]},
    ],
  },
];

export const checkSubmissions: CheckSubmission[] = [
  { id: 'chk-1', vehicleId: 'veh-1', driverId: 'drv-1', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-27T06:15:00Z', receivedAt: '2026-10-27T06:16:00Z', offline: false, startMileage: 48200, endMileage: 48230, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  { id: 'chk-2', vehicleId: 'veh-2', driverId: 'drv-2', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-27T06:22:00Z', receivedAt: '2026-10-27T06:23:00Z', offline: false, startMileage: 31420, endMileage: 31450, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  { id: 'chk-3', vehicleId: 'veh-3', driverId: 'drv-3', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-26T06:10:00Z', receivedAt: '2026-10-26T06:11:00Z', offline: false, startMileage: 98670, endMileage: 98700, implausibleMileage: false, locked: true, passed: false, criticalFailures: 1, defectIds: ['def-1'], corrections: [] },
  { id: 'chk-4', vehicleId: 'veh-4', driverId: 'drv-3', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-26T06:30:00Z', receivedAt: '2026-10-26T06:31:00Z', offline: false, startMileage: 126380, endMileage: 126400, implausibleMileage: false, locked: true, passed: false, criticalFailures: 1, defectIds: ['def-2'], corrections: [] },
  { id: 'chk-5', vehicleId: 'veh-5', driverId: 'drv-4', templateVersionId: 'tpl-2-v1', submittedAt: '2026-10-27T06:05:00Z', receivedAt: '2026-10-27T06:05:30Z', offline: false, startMileage: 67780, endMileage: 67800, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  { id: 'chk-6', vehicleId: 'veh-9', driverId: 'drv-8', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-27T06:18:00Z', receivedAt: '2026-10-27T06:18:30Z', offline: false, startMileage: 41180, endMileage: 41200, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  // Offline-submitted check (edge case)
  { id: 'chk-7', vehicleId: 'veh-15', driverId: 'drv-13', templateVersionId: 'tpl-3-v1', submittedAt: '2026-10-27T06:00:00Z', receivedAt: '2026-10-27T08:45:00Z', offline: true, startMileage: 142780, endMileage: 142800, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [{ at: '2026-10-27T09:00:00Z', by: 'James Okoro', note: 'Receipt time adjusted — submission was offline at school-run start' }] },
  // Implausible mileage (edge case)
  { id: 'chk-8', vehicleId: 'veh-7', driverId: 'drv-6', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-27T06:20:00Z', receivedAt: '2026-10-27T06:20:30Z', offline: false, startMileage: 74200, endMileage: 75200, implausibleMileage: true, locked: false, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  { id: 'chk-9', vehicleId: 'veh-11', driverId: 'drv-10', templateVersionId: 'tpl-1-v3', submittedAt: '2026-10-26T06:12:00Z', receivedAt: '2026-10-26T06:12:30Z', offline: false, startMileage: 15580, endMileage: 15600, implausibleMileage: false, locked: true, passed: true, criticalFailures: 0, defectIds: [], corrections: [] },
  // Missing check for veh-6 today (edge case — no submission)
];

export const defects: Defect[] = [
  {
    id: 'def-1', ref: 'DEF-2026-0142', vehicleId: 'veh-3', reportedById: 'drv-3', reportedAt: '2026-10-26T06:12:00Z',
    severity: 'major', status: 'assigned', title: 'Nearside brake light not working',
    description: 'NS brake light bulb failed during morning check.', component: 'Lighting',
    checkSubmissionId: 'chk-3', assignedTo: 'Tom Bridger', blocksAllocation: false,
    releasedToService: false,
    events: [
      { at: '2026-10-26T06:12:00Z', actor: 'Robert Khan', action: 'Defect reported', note: 'Via daily check chk-3' },
      { at: '2026-10-26T08:00:00Z', actor: 'James Okoro', action: 'Triaged', note: 'Major — schedule repair' },
      { at: '2026-10-26T09:30:00Z', actor: 'James Okoro', action: 'Assigned to Tom Bridger' },
    ],
  },
  {
    id: 'def-2', ref: 'DEF-2026-0143', vehicleId: 'veh-4', reportedById: 'drv-3', reportedAt: '2026-10-26T06:35:00Z',
    severity: 'critical', status: 'repair_complete', title: 'Front brake pads below minimum thickness',
    description: 'Front pads measured at 2.1mm — below 3mm legal minimum. Vehicle must not move.',
    component: 'Brakes', checkSubmissionId: 'chk-4', assignedTo: 'Tom Bridger', workshopJobId: 'wj-1',
    releasedToService: false, blocksAllocation: true,
    events: [
      { at: '2026-10-26T06:35:00Z', actor: 'Robert Khan', action: 'Defect reported', note: 'Critical failure via daily check' },
      { at: '2026-10-26T07:00:00Z', actor: 'James Okoro', action: 'Triaged', note: 'Critical — vehicle off-road immediately' },
      { at: '2026-10-26T07:30:00Z', actor: 'James Okoro', action: 'Assigned to Tom Bridger' },
      { at: '2026-10-26T11:00:00Z', actor: 'Tom Bridger', action: 'Booked into workshop', note: 'Job WJ-2026-0031' },
      { at: '2026-10-27T10:00:00Z', actor: 'Tom Bridger', action: 'Repair complete', note: 'Front pads replaced. Awaiting independent verification before release to service.' },
    ],
  },
  {
    id: 'def-3', ref: 'DEF-2026-0138', vehicleId: 'veh-7', reportedById: 'drv-6', reportedAt: '2026-10-20T06:30:00Z',
    severity: 'minor', status: 'monitored', title: 'Slight oil weep from rocker cover gasket',
    description: 'Minor oil seepage observed, level not dropping significantly.', component: 'Engine',
    blocksAllocation: false, releasedToService: true, releasedBy: 'James Okoro', releasedAt: '2026-10-20T12:00:00Z', verifiedBy: 'Tom Bridger', verifiedAt: '2026-10-20T12:30:00Z',
    events: [
      { at: '2026-10-20T06:30:00Z', actor: 'Sandra Price', action: 'Defect reported' },
      { at: '2026-10-20T10:00:00Z', actor: 'Tom Bridger', action: 'Monitored', note: 'No action needed now — recheck at next service' },
      { at: '2026-10-20T12:30:00Z', actor: 'Tom Bridger', action: 'Independently verified' },
      { at: '2026-10-20T12:30:00Z', actor: 'James Okoro', action: 'Released to service' },
    ],
  },
  {
    id: 'def-4', ref: 'DEF-2026-0144', vehicleId: 'veh-10', reportedById: 'drv-9', reportedAt: '2026-10-27T06:25:00Z',
    severity: 'minor', status: 'new', title: 'Nearside wing mirror glass loose',
    description: 'Mirror glass slightly loose, still usable.', component: 'Body',
    blocksAllocation: false, releasedToService: false,
    events: [
      { at: '2026-10-27T06:25:00Z', actor: 'Gareth Owen', action: 'Defect reported' },
    ],
  },
  {
    id: 'def-5', ref: 'DEF-2026-0140', vehicleId: 'veh-12', reportedById: 'drv-9', reportedAt: '2026-10-24T11:30:00Z',
    severity: 'major', status: 'booked', title: 'Offside rear panel damage from accident',
    description: 'Significant panel damage following incident INC-2026-008.', component: 'Body',
    assignedTo: 'Tom Bridger', workshopJobId: 'wj-2', blocksAllocation: false, releasedToService: false,
    events: [
      { at: '2026-10-24T11:30:00Z', actor: 'Gareth Owen', action: 'Defect reported' },
      { at: '2026-10-24T14:00:00Z', actor: 'James Okoro', action: 'Triaged' },
      { at: '2026-10-25T09:00:00Z', actor: 'James Okoro', action: 'Booked into workshop' },
    ],
  },
  {
    id: 'def-6', ref: 'DEF-2026-0135', vehicleId: 'veh-22', reportedById: 'drv-22', reportedAt: '2026-10-15T08:00:00Z',
    severity: 'critical', status: 'assigned', title: 'Engine failure — won\'t start',
    description: 'Engine cranks but does not fire. Suspected fuel pump.', component: 'Engine',
    assignedTo: 'Tom Bridger', blocksAllocation: true, releasedToService: false,
    events: [
      { at: '2026-10-15T08:00:00Z', actor: 'Mark Davies', action: 'Defect reported' },
      { at: '2026-10-15T09:00:00Z', actor: 'James Okoro', action: 'Triaged', note: 'Critical — off-road' },
      { at: '2026-10-15T10:00:00Z', actor: 'James Okoro', action: 'Assigned to Tom Bridger' },
    ],
  },
  {
    id: 'def-7', ref: 'DEF-2026-0145', vehicleId: 'veh-25', reportedById: 'drv-21', reportedAt: '2026-10-27T06:40:00Z',
    severity: 'minor', status: 'new', title: 'Wiper blade worn — driver side',
    description: 'Streaking on driver side wiper.', component: 'Visibility',
    blocksAllocation: false, releasedToService: false,
    events: [{ at: '2026-10-27T06:40:00Z', actor: 'Andrew West', action: 'Defect reported' }],
  },
];

export const serviceSchedules: ServiceSchedule[] = vehicles.map(veh => ({
  id: 'ss-' + veh.id,
  vehicleId: veh.id,
  nextDate: veh.nextServiceDate,
  nextMileage: veh.nextServiceMileage,
  intervalMonths: veh.serviceIntervalMonths,
  intervalMiles: veh.serviceIntervalMiles,
  lastCompletedDate: veh.nextServiceDate ? subtractMonths(veh.nextServiceDate, veh.serviceIntervalMonths) : undefined,
  lastCompletedMileage: veh.nextServiceMileage ? veh.nextServiceMileage - veh.serviceIntervalMiles : undefined,
}));

function subtractMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString();
}

export const workshopJobs: WorkshopJob[] = [
  { id: 'wj-1', ref: 'WJ-2026-0031', vehicleId: 'veh-4', defectId: 'def-2', type: 'Brake pad replacement', scheduledFor: '2026-10-26T11:00:00Z', bay: 'Bay 1', technician: 'Tom Bridger', status: 'complete', estimatedHours: 2, cost: 184.50, approvedBy: 'James Okoro' },
  { id: 'wj-2', ref: 'WJ-2026-0032', vehicleId: 'veh-12', defectId: 'def-5', type: 'Panel repair and respray', scheduledFor: '2026-10-28T09:00:00Z', bay: 'Bay 2', technician: 'Tom Bridger', status: 'scheduled', estimatedHours: 8, cost: undefined, approvedBy: undefined },
  { id: 'wj-3', ref: 'WJ-2026-0033', vehicleId: 'veh-22', defectId: 'def-6', type: 'Fuel pump diagnosis and replacement', scheduledFor: '2026-10-28T10:00:00Z', bay: 'Bay 1', technician: 'Tom Bridger', status: 'scheduled', estimatedHours: 4, cost: undefined, approvedBy: undefined },
  { id: 'wj-4', ref: 'WJ-2026-0034', vehicleId: 'veh-2', defectId: undefined, type: 'Scheduled service — 12 month / 46k', scheduledFor: '2026-11-15T09:00:00Z', bay: 'Bay 2', technician: 'Tom Bridger', status: 'scheduled', estimatedHours: 3, cost: undefined, approvedBy: 'James Okoro' },
  { id: 'wj-5', ref: 'WJ-2026-0035', vehicleId: 'veh-7', defectId: undefined, type: 'Scheduled service (overdue by mileage)', scheduledFor: '2026-10-29T09:00:00Z', bay: 'Bay 1', technician: 'Tom Bridger', status: 'scheduled', estimatedHours: 3, cost: undefined, approvedBy: 'James Okoro' },
];

export const costEntries: CostEntry[] = [
  { id: 'cost-1', vehicleId: 'veh-4', date: '2026-10-26T12:00:00Z', category: 'repair', description: 'Front brake pads — parts and labour', vendor: 'DEC Workshop', amountGBP: 184.50, linkedWorkshopJobId: 'wj-1', linkedInvoiceRef: 'INV-2026-0421', approvedBy: 'James Okoro' },
  { id: 'cost-2', vehicleId: 'veh-1', date: '2026-10-20T08:00:00Z', category: 'fuel', description: 'Diesel — full tank', vendor: 'Tesco Dunstable', amountGBP: 78.40 },
  { id: 'cost-3', vehicleId: 'veh-2', date: '2026-10-19T08:00:00Z', category: 'fuel', description: 'Diesel — full tank', vendor: 'Shell Luton', amountGBP: 72.10 },
  { id: 'cost-4', vehicleId: 'veh-5', date: '2026-10-18T08:00:00Z', category: 'fuel', description: 'Diesel — full tank', vendor: 'BP Dunstable', amountGBP: 81.20 },
  { id: 'cost-5', vehicleId: 'veh-1', date: '2026-09-15T08:00:00Z', category: 'maintenance', description: 'Scheduled service — 12 month', vendor: 'DEC Workshop', amountGBP: 245.00, linkedInvoiceRef: 'INV-2026-0390' },
  { id: 'cost-6', vehicleId: 'veh-3', date: '2026-08-01T08:00:00Z', category: 'maintenance', description: 'MOT preparation', vendor: 'Kwik Fit Dunstable', amountGBP: 95.00 },
  { id: 'cost-7', vehicleId: 'veh-1', date: '2026-08-01T08:00:00Z', category: 'insurance', description: 'Annual insurance premium', vendor: 'Allianz', amountGBP: 1850.00 },
  { id: 'cost-8', vehicleId: 'veh-4', date: '2026-10-26T12:00:00Z', category: 'repair', description: 'Brake pad parts', vendor: 'Euro Car Parts', amountGBP: 84.50, linkedWorkshopJobId: 'wj-1', doubleCountedFlag: true },
];

export const incidents: Incident[] = [
  { id: 'inc-1', ref: 'INC-2026-008', vehicleId: 'veh-12', driverId: 'drv-9', date: '2026-10-24T10:30:00Z', type: 'accident', severity: 'moderate', description: 'Reversed into bollard in car park causing OSR panel damage. No injuries.', location: 'Luton Airport short-stay car park', status: 'investigating', reportedBy: 'Gareth Owen' },
  { id: 'inc-2', ref: 'INC-2026-006', vehicleId: 'veh-3', driverId: 'drv-3', date: '2026-10-10T14:00:00Z', type: 'damage', severity: 'minor', description: 'Minor scuff to NSF bumper in tight street.', location: 'Dunstable town centre', status: 'closed', reportedBy: 'Robert Khan' },
  { id: 'inc-3', ref: 'INC-2026-009', vehicleId: undefined, driverId: 'drv-12', date: '2026-10-26T16:00:00Z', type: 'near_miss', severity: 'serious', description: 'Near miss with cyclist at junction — passenger reported harsh braking.', location: 'Luton — Castle Street junction', status: 'investigating', reportedBy: 'Priya Patel' },
];

export const integrations: Integration[] = [
  { id: 'int-1', name: 'DVLA ADD (Automatic Driving Licence Download)', category: 'Licence checking', state: 'simulated', description: 'Driver licence entitlement and status checks.', lastSync: '2026-10-27T06:00:00Z', notes: 'Simulated adapter — no live government connection. Replace with DVLA ADD registration for production.' },
  { id: 'int-2', name: 'DVSA MOT History', category: 'Vehicle checks', state: 'simulated', description: 'MOT test history and current status.', lastSync: '2026-10-27T06:00:00Z', notes: 'Simulated adapter. Production requires DVSA MOT History API enrolment.' },
  { id: 'int-3', name: 'DVLA VES (Vehicle Enquiry Service)', category: 'Vehicle checks', state: 'not_connected', description: 'Vehicle tax and MOT status by registration.', notes: 'Not connected. Add DVLA VES API key to activate.' },
  { id: 'int-4', name: 'Central Bedfordshire Council portal', category: 'Council', state: 'manual_verification', description: 'Council licensing and six-month checks.', notes: 'Manual verification — operator checks council portal and records outcome. No automated connection.' },
  { id: 'int-5', name: 'Luton Borough Council portal', category: 'Council', state: 'manual_verification', description: 'Council licensing checks.', notes: 'Manual verification.' },
  { id: 'int-6', name: 'DBS (Disclosure and Barring Service)', category: 'Vetting', state: 'manual_verification', description: 'Criminal record checks for drivers and PAs.', notes: 'Manual verification via DBS paper/portal process. No API connection.' },
  { id: 'int-7', name: 'SMS notifications', category: 'Notifications', state: 'not_connected', description: 'SMS alerts for defects and check reminders.', notes: 'Not connected. Configure a provider (e.g. Twilio) to activate.' },
  { id: 'int-8', name: 'Email notifications', category: 'Notifications', state: 'simulated', description: 'Email alerts and report delivery.', lastSync: '2026-10-27T06:00:00Z', notes: 'Simulated — emails logged but not sent. Configure SMTP for production.' },
  { id: 'int-9', name: 'Push notifications (mobile app)', category: 'Notifications', state: 'not_connected', description: 'Push to driver mobile app.', notes: 'Not connected. Mobile app out of scope for this build.' },
];

export const rules: RuleEntry[] = [
  { id: 'rule-1', name: 'Six-month council vehicle check', source: 'Central Bedfordshire Council licensing condition', jurisdiction: 'Central Bedfordshire', effectiveDate: '2024-01-01', reviewer: 'Sarah Whitfield', nextReviewDate: '2027-01-01', status: 'needs_validation', summary: 'Licensed vehicles require a council inspection every 6 months, separate from the annual MOT. The council date is independent of the MOT date and must not be altered by an MOT refresh.' },
  { id: 'rule-2', name: 'Daily walkaround check requirement', source: 'DVSA Guide to maintaining roadworthiness', jurisdiction: 'UK', effectiveDate: '2023-03-01', reviewer: 'Sarah Whitfield', nextReviewDate: '2027-03-01', status: 'active', summary: 'Drivers must complete a daily walkaround check before using a vehicle. Defects must be reported.' },
  { id: 'rule-3', name: 'Driver licence checking frequency', source: 'DVSA Goods Vehicle Operator Licensing Guide', jurisdiction: 'UK', effectiveDate: '2024-01-01', reviewer: 'Anita Sharma', nextReviewDate: '2027-01-01', status: 'active', summary: 'Driver licences should be checked at a defined frequency. This register records the operator policy; intervals are set by the operator, not assumed.' },
  { id: 'rule-4', name: 'MOT annual test — Class 4 and 7', source: 'DVSA MOT testing guide', jurisdiction: 'UK', effectiveDate: '2023-01-01', reviewer: 'Sarah Whitfield', nextReviewDate: '2027-01-01', status: 'active', summary: 'Vehicles over 3 years old require an annual MOT test. Booking a test does not clear an expired MOT; only a pass does.' },
  { id: 'rule-5', name: 'Central Bedfordshire council profile', source: 'Operator licensing — Central Bedfordshire', jurisdiction: 'Central Bedfordshire', effectiveDate: '2024-06-01', reviewer: 'Sarah Whitfield', nextReviewDate: '2026-12-01', status: 'needs_validation', summary: 'Local council licensing requirements. This profile needs validation against current council published conditions.' },
  { id: 'rule-6', name: 'Luton council profile', source: 'Operator licensing — Luton Borough', jurisdiction: 'Luton', effectiveDate: '2024-06-01', reviewer: 'Sarah Whitfield', nextReviewDate: '2026-12-01', status: 'needs_validation', summary: 'Local council licensing requirements. This profile needs validation against current council published conditions.' },
  { id: 'rule-7', name: 'DBS renewal review — operator policy', source: 'Operator safeguarding policy', jurisdiction: 'Internal', effectiveDate: '2024-01-01', reviewer: 'Anita Sharma', nextReviewDate: '2027-01-01', status: 'active', summary: 'DBS reviews are conducted on a defined cycle set by operator policy. The register does not assume a statutory renewal interval.' },
];

export const auditEntries: AuditEntry[] = [
  { id: 'a-1', at: '2026-10-27T09:05:00Z', actor: 'Anita Sharma', actorRole: 'hr_vetting', action: 'view_dbs_detail', resource: 'assurance.dbs', resourceId: 'drv-12', company: 'c-dec', detail: 'Viewed DBS metadata for Joanna Reed', restricted: true },
  { id: 'a-2', at: '2026-10-27T08:30:00Z', actor: 'Sarah Whitfield', actorRole: 'owner', action: 'manage_companies', resource: 'admin.companies', company: 'c-dec', detail: 'Archived Bedfordshire Chauffeur Services Ltd', restricted: false },
  { id: 'a-3', at: '2026-10-26T14:00:00Z', actor: 'James Okoro', actorRole: 'company_manager', action: 'edit', resource: 'vehicles', resourceId: 'veh-4', company: 'c-dec', detail: 'Updated status to blocked following critical defect', restricted: false },
  { id: 'a-4', at: '2026-10-26T11:00:00Z', actor: 'Tom Bridger', actorRole: 'mechanic', action: 'edit', resource: 'defects', resourceId: 'def-2', company: 'c-dec', detail: 'Marked repair complete on DEF-2026-0143', restricted: false },
  { id: 'a-5', at: '2026-10-25T16:00:00Z', actor: 'Priya Patel', actorRole: 'controller', action: 'view', resource: 'assurance.dbs', resourceId: 'drv-12', company: 'c-dec', detail: 'Viewed DBS summary (Cleared/Pending/Restricted + next review only)', restricted: false },
  { id: 'a-6', at: '2026-10-25T10:00:00Z', actor: 'Anita Sharma', actorRole: 'hr_vetting', action: 'view_dbs_detail', resource: 'assurance.dbs', resourceId: 'pa-7', company: 'c-schoolrun', detail: 'Viewed DBS metadata for Tara Nichols (safeguarding case)', restricted: true },
];

export const notifications: Notification[] = [
  { id: 'n-1', at: '2026-10-27T07:00:00Z', title: 'Critical defect awaiting verification', body: 'DEF-2026-0143 on BD55 KLM — front brake pads replaced, awaiting independent verification before release to service.', kind: 'critical', read: false, link: '/defects/def-2' },
  { id: 'n-2', at: '2026-10-27T06:30:00Z', title: 'MOT expired', body: 'WT65 XPL — MOT expired 14 days ago. Vehicle is blocked.', kind: 'critical', read: false, link: '/fleet/vehicles/veh-3' },
  { id: 'n-3', at: '2026-10-27T06:00:00Z', title: 'Missing daily check', body: 'YE24 GHI has no daily check submitted today.', kind: 'warning', read: false, link: '/checks/daily' },
  { id: 'n-4', at: '2026-10-26T17:00:00Z', title: 'DBS review due', body: 'Steven Holt — DBS review due in 8 days.', kind: 'warning', read: true, link: '/assurance/dbs' },
  { id: 'n-5', at: '2026-10-26T12:00:00Z', title: 'Offline check received', body: 'Check chk-7 for SR12 KID was submitted offline and received 2h45m later.', kind: 'info', read: true, link: '/checks/daily' },
];

export const greyFleet: GreyFleetEntry[] = [
  { id: 'gf-1', driverId: 'drv-20', vehicleRegistration: 'PR19 VTE', makeModel: 'Honda Civic 2019', insuranceExpiry: '2027-03-15', motExpiry: '2027-01-20', businessUseConfirmed: true, lastChecked: '2026-10-01', status: 'ready' },
  { id: 'gf-2', driverId: 'drv-19', vehicleRegistration: 'TM66 HGH', makeModel: 'Toyota Yaris 2016', insuranceExpiry: '2026-11-10', motExpiry: '2027-02-28', businessUseConfirmed: true, lastChecked: '2026-09-15', status: 'due_soon' },
  { id: 'gf-3', driverId: 'drv-21', vehicleRegistration: 'BN02 WXY', makeModel: 'Vauxhall Corsa 2002', insuranceExpiry: '2026-10-05', motExpiry: '2026-09-20', businessUseConfirmed: false, lastChecked: '2026-06-01', status: 'blocked' },
];
