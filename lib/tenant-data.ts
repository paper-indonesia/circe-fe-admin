import type { Patient, Staff, Treatment, Booking, Payment, Activity } from "./types"

// All data now comes from MongoDB - no hardcoded data
export const tenantData = {
  "beauty-clinic-jakarta": {
    patients: [],
    staff: [],
    treatments: [],
    bookings: [],
    payments: [],
    activities: []
  },
  "beauty-clinic-bali": {
    patients: [],
    staff: [],
    treatments: [],
    bookings: [],
    payments: [],
    activities: []
  },
  "skin-care-surabaya": {
    patients: [],
    staff: [],
    treatments: [],
    bookings: [],
    payments: [],
    activities: []
  }
}

// This function will return empty data - MongoDB is the source of truth
export function getTenantData(tenantId: string) {
  return tenantData[tenantId as keyof typeof tenantData] || {
    patients: [],
    staff: [],
    treatments: [],
    bookings: [],
    payments: [],
    activities: []
  }
}