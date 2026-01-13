import mongoose from 'mongoose';

const importBatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for faster searches
importBatchSchema.index({ uploadedAt: -1 });
importBatchSchema.index({ name: 1 });

export default mongoose.models.ImportBatch || mongoose.model('ImportBatch', importBatchSchema);
