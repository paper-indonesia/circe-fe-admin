import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITenant extends Document {
  _id: string
  name: string
  slug: string
  domain?: string
  config: {
    logo?: string
    theme?: {
      primaryColor?: string
      secondaryColor?: string
    }
    features?: {
      maxUsers?: number
      maxBookings?: number
    }
  }
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    domain: {
      type: String,
      trim: true,
    },
    config: {
      logo: String,
      theme: {
        primaryColor: {
          type: String,
          default: '#8B5CF6',
        },
        secondaryColor: {
          type: String,
          default: '#EC4899',
        },
      },
      features: {
        maxUsers: {
          type: Number,
          default: 100,
        },
        maxBookings: {
          type: Number,
          default: 1000,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Static method to find active tenants
TenantSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Static method to find tenant by slug
TenantSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true })
}

const Tenant: Model<ITenant> = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema)

export default Tenant