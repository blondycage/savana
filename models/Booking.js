import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Import batch reference
    importBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImportBatch'
    },

    // System generated unique ID
    systemBookingId: {
      type: String,
      unique: true,
      default: function() {
        return `SYS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },

    // Excel columns - all fields optional, default to 'Not Assigned'
    eTicket: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    bookingNumber: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    surname: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    firstName: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    passport: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    travelDate: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    returnDate: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    visa: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    dateOfBirth: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    nationality: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },

    // Pricing fields
    packagePrice: {
      type: Number,
      default: 0,
      min: 0
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0
    },
    remaining: {
      type: Number,
      default: 0
    },
    umraVisaFee: {
      type: Number,
      default: 0,
      min: 0
    },

    // Additional fields
    privateRoom: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },

    // Contact info (collected later)
    email: {
      type: String,
      default: 'Not Assigned',
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: 'Not Assigned',
      trim: true
    },

    // Legacy field for payment tracking
    totalPayments: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook removed - using default function instead

// Indexes for searching
bookingSchema.index({ systemBookingId: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ eTicket: 1 });
bookingSchema.index({ travelDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ importBatch: 1 });
bookingSchema.index({ surname: 1, firstName: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
