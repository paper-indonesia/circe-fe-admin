import mongoose, { Schema, model, models } from 'mongoose'

export interface IPatient {
  _id?: string
  tenantId: string
  name: string
  phone: string
  email?: string
  notes?: string
  lastVisitAt?: Date
  totalVisits: number
  createdAt: Date
  updatedAt: Date
}

const PatientSchema = new Schema<IPatient>(
  {
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Invalid email format'
      }
    },
    notes: {
      type: String,
      default: '',
    },
    lastVisitAt: {
      type: Date,
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
)

// Compound index for tenant isolation
PatientSchema.index({ tenantId: 1, phone: 1 }, { unique: true })
PatientSchema.index({ tenantId: 1, email: 1 }, { sparse: true })
PatientSchema.index({ tenantId: 1, createdAt: -1 })

// Instance methods
PatientSchema.methods.incrementVisits = function() {
  this.totalVisits += 1
  this.lastVisitAt = new Date()
  return this.save()
}

// Static methods for tenant-scoped queries
PatientSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId }).sort({ createdAt: -1 })
}

PatientSchema.statics.findByTenantAndPhone = function(tenantId: string, phone: string) {
  return this.findOne({ tenantId, phone })
}

const Patient = models.Patient || model<IPatient>('Patient', PatientSchema)

export default Patient