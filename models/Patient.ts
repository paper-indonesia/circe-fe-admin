import mongoose, { Schema, model, models } from 'mongoose'

export interface IPatient {
  _id?: string
  ownerId: string
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
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
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

// Compound index for user isolation
PatientSchema.index({ ownerId: 1, phone: 1 }, { unique: true })
PatientSchema.index({ ownerId: 1, email: 1 }, { sparse: true })
PatientSchema.index({ ownerId: 1, createdAt: -1 })

// Instance methods
PatientSchema.methods.incrementVisits = function() {
  this.totalVisits += 1
  this.lastVisitAt = new Date()
  return this.save()
}

// Static methods for user-scoped queries
PatientSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId }).sort({ createdAt: -1 })
}

PatientSchema.statics.findByOwnerAndPhone = function(ownerId: string, phone: string) {
  return this.findOne({ ownerId, phone })
}

const Patient = models.Patient || model<IPatient>('Patient', PatientSchema)

export default Patient