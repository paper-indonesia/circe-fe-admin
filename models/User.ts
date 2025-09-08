import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'staff' | 'user' | 'platform_admin'
  tenantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'user', 'platform_admin'],
      default: 'user',
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
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

// Compound index for unique email per tenant
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true })

// Static method to find users by tenant
UserSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId, isActive: true })
}

// Static method to find user by email and tenant
UserSchema.statics.findByEmailAndTenant = function(email: string, tenantId: string) {
  return this.findOne({ email: email.toLowerCase(), tenantId, isActive: true })
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User