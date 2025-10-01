import mongoose, { Schema, Document } from 'mongoose'

export interface ITenantSettings extends Document {
  ownerId: string // User ID who owns this business
  businessType: 'beauty-clinic' | 'education' | 'consulting' | 'fitness' | 'healthcare' | 'salon' | 'spa' | 'custom'
  businessName: string
  terminology: {
    staff: string          // "Staff" | "Teacher" | "Tutor" | "Trainer" | "Therapist"
    staffSingular: string  // "Staff Member" | "Teacher" | "Tutor" | etc
    treatment: string      // "Treatment" | "Subject" | "Course" | "Service" | "Session"
    treatmentSingular: string
    patient: string        // "Patient" | "Student" | "Client" | "Customer" | "Member"
    patientSingular: string
    booking: string        // "Appointment" | "Class" | "Session" | "Meeting" | "Booking"
    bookingSingular: string
  }
  categories: string[] // Dynamic categories based on business type
  customFields: {
    staff: Array<{
      key: string
      label: string
      type: 'text' | 'number' | 'select' | 'textarea' | 'date'
      required: boolean
      options?: string[]
    }>
    treatment: Array<{
      key: string
      label: string
      type: 'text' | 'number' | 'select' | 'textarea' | 'date'
      required: boolean
      options?: string[]
    }>
    patient: Array<{
      key: string
      label: string
      type: 'text' | 'number' | 'select' | 'textarea' | 'date'
      required: boolean
      options?: string[]
    }>
  }
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

const TenantSettingsSchema = new Schema<ITenantSettings>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true, // One settings per user/business
      index: true,
    },
    businessType: {
      type: String,
      enum: ['beauty-clinic', 'education', 'consulting', 'fitness', 'healthcare', 'salon', 'spa', 'custom'],
      required: true,
      default: 'custom',
    },
    businessName: {
      type: String,
      required: true,
    },
    terminology: {
      staff: { type: String, default: 'Staff' },
      staffSingular: { type: String, default: 'Staff Member' },
      treatment: { type: String, default: 'Services' },
      treatmentSingular: { type: String, default: 'Service' },
      patient: { type: String, default: 'Clients' },
      patientSingular: { type: String, default: 'Client' },
      booking: { type: String, default: 'Bookings' },
      bookingSingular: { type: String, default: 'Booking' },
    },
    categories: {
      type: [String],
      default: ['General'],
    },
    customFields: {
      staff: {
        type: [
          {
            key: String,
            label: String,
            type: { type: String, enum: ['text', 'number', 'select', 'textarea', 'date'] },
            required: Boolean,
            options: [String],
          },
        ],
        default: [],
      },
      treatment: {
        type: [
          {
            key: String,
            label: String,
            type: { type: String, enum: ['text', 'number', 'select', 'textarea', 'date'] },
            required: Boolean,
            options: [String],
          },
        ],
        default: [],
      },
      patient: {
        type: [
          {
            key: String,
            label: String,
            type: { type: String, enum: ['text', 'number', 'select', 'textarea', 'date'] },
            required: Boolean,
            options: [String],
          },
        ],
        default: [],
      },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for data isolation - ensure each user has unique settings
TenantSettingsSchema.index({ ownerId: 1 }, { unique: true })

export default mongoose.models.TenantSettings || mongoose.model<ITenantSettings>('TenantSettings', TenantSettingsSchema)