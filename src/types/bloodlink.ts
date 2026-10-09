export type UserRole = 'hospital' | 'centre' | 'donor' | 'unselected';

export type HospitalTab = 'overview' | 'new-request' | 'my-requests' | 'nearby-centres';

export type CentreTab =
  | 'overview'
  | 'inventory'
  | 'requests'
  | 'appointments'
  | 'camps'
  | 'forecasts'
  | 'profile';

export type DonorTab =
  | 'home'
  | 'emergencies'
  | 'donate-nearby'
  | 'camps'
  | 'my-donations'
  | 'profile';

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type ComponentType = 'whole' | 'prbc' | 'platelets' | 'plasma';

export type UrgencyLevel = 'immediate' | '2hrs' | '24hrs';

export type RequestStatus = 'critical' | 'in_transit' | 'matched' | 'fulfilled';

export type TimelineStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SourceBreakdown {
  inventoryUnits: number;
  inventorySource?: string;
  donorUnits: number;
  donorNames?: string[];
}

export interface EmergencyRequest {
  id: string;
  requestId: string;
  hospitalName: string;
  location: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  elapsedTime: string;
  doctorName: string;
  status: RequestStatus;
  timelineStep: TimelineStep;
  sourceBreakdown: SourceBreakdown;
  requiredBy: string;
  notes?: string;
  eta?: string;
  courierName?: string;
  temperature?: string;
}

export type DonorStatus = 'available' | 'notified' | 'accepted' | 'unavailable';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  locationArea: string;
  avatarUrl: string;
  daysSinceDonation: number;
  verifiedDonationsCount: number;
  isAvailable: boolean;
  status: DonorStatus;
  phone?: string;
  badges: string[];
  lastDonationDate: string;
}

export interface DonationAppointment {
  id: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  centreId: string;
  centreName: string;
  date: string;
  timeSlot: string;
  component: ComponentType;
  arrivalStatus: 'scheduled' | 'arrived' | 'cancelled';
  screeningStatus: 'pending' | 'screened_eligible' | 'screened_ineligible';
  donationStatus: 'scheduled' | 'in_progress' | 'completed';
  isVerified: boolean;
  passRef: string;
  notes?: string;
}

export interface DonorDonationRecord {
  id: string;
  date: string;
  centreName: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  units: number;
  verificationStatus: 'verified' | 'pending';
  certificateCode: string;
  medicalOfficer: string;
}

export interface InventoryItem {
  bloodGroup: BloodGroup;
  component: ComponentType;
  inStockUnits: number;
  targetMinUnits: number;
  status: 'critical' | 'low' | 'stable';
  lastUpdated: string;
  expectedDemand7D: number;
}

export interface BloodCentre {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  operatingHours: string;
  phone: string;
  isAuthorized: boolean;
  licenseNumber?: string;
  supportedComponents?: string[];
  stockByGroup: Record<
    BloodGroup,
    {
      units: number;
      status: 'critical' | 'low' | 'stable';
      forecastGap: number;
    }
  >;
}

export interface DonationCamp {
  id: string;
  title: string;
  locationName: string;
  address: string;
  dateStr: string;
  timeStr: string;
  targetTag: string;
  bannerUrl: string;
  registeredCount: number;
  goalCount: number;
}

export interface ForecastItem {
  bloodGroup: BloodGroup;
  component?: ComponentType;
  historicalDemand30D: number;
  currentInventory: number;
  predictedDemand7D: number;
  expectedSupply7D: number;
  projectedGap: number;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  recommendedAction: string;
}

export type NavTab =
  | 'overview'
  | 'requests'
  | 'inventory'
  | 'donors'
  | 'donate-nearby'
  | 'camps'
  | 'forecasts';


