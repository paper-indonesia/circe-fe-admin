import mongoose, { Schema, model, models } from 'mongoose'

export interface IBooking {
  _id?: string
  tenantId: string
  patientId: string
  patientName?: string
  staffId: string
  treatmentId: string
  startAt: Date
  endAt: Date
  status: 'available' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  source: 'walk-in' | 'online'
  paymentStatus: 'unpaid' | 'deposit' | 'paid'
  notes?: string
  queueNumber?: number // For walk-in bookings
  paymentMethod?: string
  paymentAmount?: number
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      ref: 'Patient',
    },
    patientName: {
      type: String,
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
      ref: 'Staff',
    },
    treatmentId: {
      type: String,
      required: [true, 'Treatment ID is required'],
      ref: 'Treatment',
    },
    startAt: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endAt: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['walk-in', 'online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'deposit', 'paid'],
      default: 'unpaid',
    },
    notes: {
      type: String,
      default: '',
    },
    queueNumber: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
    paymentAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance and constraints
BookingSchema.index({ tenantId: 1, startAt: 1 })
BookingSchema.index({ tenantId: 1, staffId: 1, startAt: 1 })
BookingSchema.index({ tenantId: 1, patientId: 1 })
BookingSchema.index({ tenantId: 1, status: 1 })
BookingSchema.index({ tenantId: 1, source: 1, createdAt: -1 })

// Prevent double booking for same staff
BookingSchema.index(
  { tenantId: 1, staffId: 1, startAt: 1, endAt: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['confirmed', 'pending'] } 
    }
  }
)

// Static methods
BookingSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId }).sort({ startAt: -1 })
}

BookingSchema.statics.findByTenantAndDate = function(tenantId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return this.find({
    tenantId,
    startAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ startAt: 1 })
}

BookingSchema.statics.findWalkInsByTenant = function(tenantId: string) {
  return this.find({ tenantId, source: 'walk-in' }).sort({ createdAt: -1 })
}

// Instance methods
BookingSchema.methods.confirm = function() {
  this.status = 'confirmed'
  return this.save()
}

BookingSchema.methods.cancel = function() {
  this.status = 'cancelled'
  return this.save()
}

BookingSchema.methods.complete = function() {
  this.status = 'completed'
  this.paymentStatus = 'paid'
  return this.save()
}

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema)

export default Booking