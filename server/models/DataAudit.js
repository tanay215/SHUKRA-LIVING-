import mongoose from 'mongoose';

const dataAuditSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'FIX', 'ERROR'],
    required: true
  },
  collection: {
    type: String,
    required: true
  },
  documentId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: false });

dataAuditSchema.index({ timestamp: -1 });
dataAuditSchema.index({ collection: 1, action: 1 });

export default mongoose.model('DataAudit', dataAuditSchema);
