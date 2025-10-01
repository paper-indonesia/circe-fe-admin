export interface IndustryTemplate {
  businessType: string
  label: string
  description: string
  icon: string
  terminology: {
    staff: string
    staffSingular: string
    treatment: string
    treatmentSingular: string
    patient: string
    patientSingular: string
    booking: string
    bookingSingular: string
  }
  categories: string[]
  sampleData?: {
    staff: any[]
    treatments: any[]
    patients: any[]
  }
}

export const industryTemplates: IndustryTemplate[] = [
  {
    businessType: 'beauty-clinic',
    label: 'Beauty & Wellness Clinic',
    description: 'Beauty treatments, spa services, skincare',
    icon: '💆',
    terminology: {
      staff: 'Staff',
      staffSingular: 'Staff Member',
      treatment: 'Treatments',
      treatmentSingular: 'Treatment',
      patient: 'Clients',
      patientSingular: 'Client',
      booking: 'Appointments',
      bookingSingular: 'Appointment',
    },
    categories: ['Facial', 'Injectable', 'Laser', 'Body Treatment', 'Skincare', 'Massage'],
  },
  {
    businessType: 'education',
    label: 'Education & Tutoring',
    description: 'Private tutoring, courses, training sessions',
    icon: '📚',
    terminology: {
      staff: 'Teachers',
      staffSingular: 'Teacher',
      treatment: 'Subjects',
      treatmentSingular: 'Subject',
      patient: 'Students',
      patientSingular: 'Student',
      booking: 'Classes',
      bookingSingular: 'Class',
    },
    categories: ['Mathematics', 'Science', 'English', 'Programming', 'Languages', 'Arts', 'Music'],
  },
  {
    businessType: 'consulting',
    label: 'Consulting Services',
    description: 'Professional consulting, advisory services',
    icon: '💼',
    terminology: {
      staff: 'Consultants',
      staffSingular: 'Consultant',
      treatment: 'Services',
      treatmentSingular: 'Service',
      patient: 'Clients',
      patientSingular: 'Client',
      booking: 'Meetings',
      bookingSingular: 'Meeting',
    },
    categories: ['Business Strategy', 'Financial', 'IT Consulting', 'HR', 'Marketing', 'Legal'],
  },
  {
    businessType: 'fitness',
    label: 'Fitness & Training',
    description: 'Gym, personal training, fitness classes',
    icon: '💪',
    terminology: {
      staff: 'Trainers',
      staffSingular: 'Trainer',
      treatment: 'Programs',
      treatmentSingular: 'Program',
      patient: 'Members',
      patientSingular: 'Member',
      booking: 'Sessions',
      bookingSingular: 'Session',
    },
    categories: ['Personal Training', 'Group Classes', 'Yoga', 'Pilates', 'CrossFit', 'Nutrition'],
  },
  {
    businessType: 'healthcare',
    label: 'Healthcare Services',
    description: 'Medical clinics, therapy, healthcare',
    icon: '🏥',
    terminology: {
      staff: 'Doctors',
      staffSingular: 'Doctor',
      treatment: 'Services',
      treatmentSingular: 'Service',
      patient: 'Patients',
      patientSingular: 'Patient',
      booking: 'Appointments',
      bookingSingular: 'Appointment',
    },
    categories: ['General Practice', 'Specialist', 'Therapy', 'Diagnostic', 'Preventive Care'],
  },
  {
    businessType: 'salon',
    label: 'Hair & Beauty Salon',
    description: 'Hair styling, coloring, beauty services',
    icon: '💇',
    terminology: {
      staff: 'Stylists',
      staffSingular: 'Stylist',
      treatment: 'Services',
      treatmentSingular: 'Service',
      patient: 'Clients',
      patientSingular: 'Client',
      booking: 'Appointments',
      bookingSingular: 'Appointment',
    },
    categories: ['Haircut', 'Coloring', 'Styling', 'Treatment', 'Manicure', 'Pedicure'],
  },
  {
    businessType: 'spa',
    label: 'Spa & Massage',
    description: 'Spa treatments, massage therapy, relaxation',
    icon: '🧖',
    terminology: {
      staff: 'Therapists',
      staffSingular: 'Therapist',
      treatment: 'Treatments',
      treatmentSingular: 'Treatment',
      patient: 'Guests',
      patientSingular: 'Guest',
      booking: 'Appointments',
      bookingSingular: 'Appointment',
    },
    categories: ['Massage', 'Body Scrub', 'Aromatherapy', 'Hot Stone', 'Reflexology', 'Facial'],
  },
  {
    businessType: 'custom',
    label: 'Custom Business',
    description: 'Define your own terminology and categories',
    icon: '⚙️',
    terminology: {
      staff: 'Staff',
      staffSingular: 'Staff Member',
      treatment: 'Services',
      treatmentSingular: 'Service',
      patient: 'Clients',
      patientSingular: 'Client',
      booking: 'Bookings',
      bookingSingular: 'Booking',
    },
    categories: ['General', 'Premium', 'Standard'],
  },
]

export function getTemplateByType(businessType: string): IndustryTemplate | undefined {
  return industryTemplates.find((t) => t.businessType === businessType)
}

export function getDefaultTemplate(): IndustryTemplate {
  return industryTemplates[0] // Beauty clinic as default
}
