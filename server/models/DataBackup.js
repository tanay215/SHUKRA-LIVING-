import mongoose from 'mongoose';

const dataBackupSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  products: [mongoose.Schema.Types.Mixed],
  settings: mongoose.Schema.Types.Mixed,
  productCount: Number,
  status: {
    type: String,
    enum: ['completed', 'failed'],
    default: 'completed'
  }
}, { timestamps: false });

dataBackupSchema.index({ timestamp: -1 });

export default mongoose.model('DataBackup', dataBackupSchema);
