import mongoose, { Schema, model, models } from 'mongoose'

export interface IStaff {
  _id?: string
  tenantId: string
  name: string
  role: string
  skills: string[]
  workingHours: string[]
  rating?: number
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StaffSchema = new Schema<IStaff>(
  {
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
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
StaffSchema.index({ tenantId: 1, isActive: 1 })
StaffSchema.index({ tenantId: 1, role: 1 })
StaffSchema.index({ tenantId: 1, rating: -1 })

// Static methods
StaffSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId, isActive: true }).sort({ rating: -1 })
}

StaffSchema.statics.findByTenantAndRole = function(tenantId: string, role: string) {
  return this.find({ tenantId, role, isActive: true })
}

StaffSchema.statics.findByTenantAndSkill = function(tenantId: string, skill: string) {
  return this.find({ tenantId, skills: skill, isActive: true })
}

const Staff = models.Staff || model<IStaff>('Staff', StaffSchema)

export default Staff