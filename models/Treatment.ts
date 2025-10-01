import mongoose, { Schema, model, models } from 'mongoose'

export interface ITreatment {
  _id?: string
  ownerId: string
  name: string
  category: string
  durationMin: number
  price: number
  description?: string
  popularity?: number
  assignedStaff: string[] // Staff IDs who can perform this treatment
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TreatmentSchema = new Schema<ITreatment>(
  {
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Treatment name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    durationMin: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      default: '',
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assignedStaff: [{
      type: String,
      ref: 'Staff',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
TreatmentSchema.index({ ownerId: 1, category: 1 })
TreatmentSchema.index({ ownerId: 1, price: 1 })
TreatmentSchema.index({ ownerId: 1, popularity: -1 })
TreatmentSchema.index({ ownerId: 1, name: 1 }, { unique: true })

// Static methods
TreatmentSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId, isActive: true }).sort({ popularity: -1 })
}

TreatmentSchema.statics.findByOwnerAndCategory = function(ownerId: string, category: string) {
  return this.find({ ownerId, category, isActive: true })
}

TreatmentSchema.statics.findByOwnerAndStaff = function(ownerId: string, staffId: string) {
  return this.find({ ownerId, assignedStaff: staffId, isActive: true })
}

const Treatment = models.Treatment || model<ITreatment>('Treatment', TreatmentSchema)

export default Treatment