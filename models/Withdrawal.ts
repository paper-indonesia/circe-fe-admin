import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IWithdrawal extends Document {
  _id: Types.ObjectId
  staffId: Types.ObjectId
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  requestDate: Date
  processedDate?: Date
  processedBy?: Types.ObjectId
  notes?: string
  rejectionReason?: string
  tenant: string
  createdAt: Date
  updatedAt: Date
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 50000, // Minimum withdrawal amount
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    bankAccount: {
      bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountName: {
        type: String,
        required: true,
      },
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    processedDate: {
      type: Date,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    tenant: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
WithdrawalSchema.index({ staffId: 1, tenant: 1 })
WithdrawalSchema.index({ status: 1, tenant: 1 })

export default mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema)