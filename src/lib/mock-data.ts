import type {
  TCM, Property, Lead, Tour, ActivityLog, FollowUp, HandoffMessage, ActiveSequence,
  LeadStage, Intent,
} from "./types";

export const TCMS: TCM[] = [
  { id: "tcm-1", name: "Aarav Mehta", initials: "AM", zone: "Koramangala", conversionRate: 0.34, avgResponseMins: 4 },
  { id: "tcm-2", name: "Priya Shah", initials: "PS", zone: "Indiranagar", conversionRate: 0.28, avgResponseMins: 7 },
  { id: "tcm-3", name: "Rohan Iyer", initials: "RI", zone: "HSR Layout", conversionRate: 0.22, avgResponseMins: 12 },
  { id: "tcm-4", name: "Neha Verma", initials: "NV", zone: "Whitefield", conversionRate: 0.41, avgResponseMins: 3 },
];

export const PROPERTIES: Property[] = [
  { id: "p-1", name: "Gharpayy Koramangala 5B", area: "Koramangala", totalBeds: 24, vacantBeds: 6, daysSinceLastBooking: 4, pricePerBed: 14000 },
  { id: "p-2", name: "Gharpayy Indiranagar 100ft", area: "Indiranagar", totalBeds: 18, vacantBeds: 9, daysSinceLastBooking: 11, pricePerBed: 12500 },
  { id: "p-3", name: "Gharpayy HSR Sector 2", area: "HSR Layout", totalBeds: 12, vacantBeds: 2, daysSinceLastBooking: 1, pricePerBed: 11000 },
  { id: "p-4", name: "Gharpayy Whitefield ITPL", area: "Whitefield", totalBeds: 32, vacantBeds: 14, daysSinceLastBooking: 18, pricePerBed: 10500 },
  { id: "p-5", name: "Gharpayy BTM 2nd Stage", area: "BTM", totalBeds: 16, vacantBeds: 1, daysSinceLastBooking: 0, pricePerBed: 13000 },
  { id: "p-6", name: "Gharpayy Koramangala 8B", area: "Koramangala", totalBeds: 28, vacantBeds: 3, daysSinceLastBooking: 2, pricePerBed: 14500 },
  { id: "p-7", name: "Gharpayy Whitefield Hope Farm", area: "Whitefield", totalBeds: 22, vacantBeds: 11, daysSinceLastBooking: 9, pricePerBed: 10000 },
];

const nowIso = new Date().toISOString();

export const LEADS: Lead[] = [
  {
    id: "l-mock-1", name: "Ananya Sharma", phone: "+91 98765 43210", source: "Instagram",
    budget: 15000, moveInDate: "2026-10-01", preferredArea: "Koramangala",
    assignedTcmId: "tcm-1", stage: "new", intent: "warm", confidence: 20,
    tags: [], nextFollowUpAt: null, responseSpeedMins: 0,
    createdAt: nowIso, updatedAt: nowIso
  },
  {
    id: "l-mock-2", name: "Rahul Singh", phone: "+91 87654 32109", source: "Website",
    budget: 12000, moveInDate: "2026-09-28", preferredArea: "Indiranagar",
    assignedTcmId: "tcm-2", stage: "new", intent: "cold", confidence: 10,
    tags: [], nextFollowUpAt: null, responseSpeedMins: 0,
    createdAt: nowIso, updatedAt: nowIso
  },
  {
    id: "l-mock-3", name: "Priya Nair", phone: "+91 76543 21098", source: "Referral",
    budget: 14000, moveInDate: "2026-10-15", preferredArea: "HSR Layout",
    assignedTcmId: "tcm-3", stage: "new", intent: "warm", confidence: 25,
    tags: [], nextFollowUpAt: null, responseSpeedMins: 0,
    createdAt: nowIso, updatedAt: nowIso
  },
  {
    id: "l-mock-4", name: "Vikram Gupta", phone: "+91 65432 10987", source: "Google Ads",
    budget: 10000, moveInDate: "2026-09-30", preferredArea: "Whitefield",
    assignedTcmId: "tcm-4", stage: "new", intent: "hot", confidence: 40,
    tags: [], nextFollowUpAt: null, responseSpeedMins: 0,
    createdAt: nowIso, updatedAt: nowIso
  },
  {
    id: "l-mock-5", name: "Neha Patil", phone: "+91 91234 56780", source: "Instagram",
    budget: 18000, moveInDate: "2026-10-05", preferredArea: "Koramangala",
    assignedTcmId: "tcm-1", stage: "new", intent: "warm", confidence: 30,
    tags: [], nextFollowUpAt: null, responseSpeedMins: 0,
    createdAt: nowIso, updatedAt: nowIso
  }
];
export const TOURS: Tour[] = [];
export const ACTIVITIES: ActivityLog[] = [];
export const FOLLOWUPS: FollowUp[] = [];
export const HANDOFFS: HandoffMessage[] = [];
export const SEQUENCES_INIT: ActiveSequence[] = [];
