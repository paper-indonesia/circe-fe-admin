import mongoose, { Schema, model, models } from 'mongoose'

export interface IStaff {
  _id?: string
  ownerId: string
  name: string
  email?: string
  role: string
  skills: string[]
  workingHours: string[]
  rating?: number
  avatar?: string
  balance: number
  totalEarnings: number
  totalWithdrawn: number
  capacity?: number // Number of clients staff can handle simultaneously
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StaffSchema = new Schema<IStaff>(
  {
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    workingHours: [{
      type: String,
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    avatar: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
      max: 50, // Maximum capacity for group classes
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankAccount: {
      bankName: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      accountName: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
StaffSchema.index({ ownerId: 1, isActive: 1 })
StaffSchema.index({ ownerId: 1, role: 1 })
StaffSchema.index({ ownerId: 1, rating: -1 })

// Static methods
StaffSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId, isActive: true }).sort({ rating: -1 })
}

StaffSchema.statics.findByOwnerAndRole = function(ownerId: string, role: string) {
  return this.find({ ownerId, role, isActive: true })
}

StaffSchema.statics.findByOwnerAndSkill = function(ownerId: string, skill: string) {
  return this.find({ ownerId, skills: skill, isActive: true })
}

const Staff = models.Staff || model<IStaff>('Staff', StaffSchema)

export default Staff