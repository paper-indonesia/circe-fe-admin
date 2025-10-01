import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Terminology {
  // Plural forms
  staff: string
  treatment: string
  patient: string
  booking: string

  // Singular forms
  staffSingular: string
  treatmentSingular: string
  patientSingular: string
  bookingSingular: string

  // Business info
  businessType: string
  businessName: string
  categories: string[]

  // Loading state
  loading: boolean
}

const defaultTerminology: Terminology = {
  staff: 'Staff',
  treatment: 'Services',
  patient: 'Clients',
  booking: 'Bookings',
  staffSingular: 'Staff Member',
  treatmentSingular: 'Service',
  patientSingular: 'Client',
  bookingSingular: 'Booking',
  businessType: 'custom',
  businessName: 'My Business',
  categories: ['General'],
  loading: true,
}

export function useTerminology(): Terminology {
  const { user } = useAuth()
  const [terminology, setTerminology] = useState<Terminology>(defaultTerminology)

  useEffect(() => {
    async function fetchSettings() {
      if (!user) {
        setTerminology({ ...defaultTerminology, loading: false })
        return
      }

      try {
        const response = await fetch('/api/settings/terminology')
        if (response.ok) {
          const data = await response.json()
          setTerminology({
            staff: data.terminology.staff || defaultTerminology.staff,
            treatment: data.terminology.treatment || defaultTerminology.treatment,
            patient: data.terminology.patient || defaultTerminology.patient,
            booking: data.terminology.booking || defaultTerminology.booking,
            staffSingular: data.terminology.staffSingular || defaultTerminology.staffSingular,
            treatmentSingular: data.terminology.treatmentSingular || defaultTerminology.treatmentSingular,
            patientSingular: data.terminology.patientSingular || defaultTerminology.patientSingular,
            bookingSingular: data.terminology.bookingSingular || defaultTerminology.bookingSingular,
            businessType: data.businessType || defaultTerminology.businessType,
            businessName: data.businessName || defaultTerminology.businessName,
            categories: data.categories || defaultTerminology.categories,
            loading: false,
          })
        } else {
          setTerminology({ ...defaultTerminology, loading: false })
        }
      } catch (error) {
        console.error('Failed to fetch terminology settings:', error)
        setTerminology({ ...defaultTerminology, loading: false })
      }
    }

    fetchSettings()
  }, [user])

  return terminology
}