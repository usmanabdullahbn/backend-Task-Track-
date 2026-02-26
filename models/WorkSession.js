import mongoose from 'mongoose';

const workSessionSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },
  date: String, // "2026-02-17"
  startTime: Date,
  endTime: Date,
  totalDistance: { type: Number, default: 0 },
  totalIdleDuration: { type: Number, default: 0 },
  status: { type: String, default: "active" }
});

workSessionSchema.index({ workerId: 1, date: 1 }, { unique: true });

const WorkSession = mongoose.model('WorkSession', workSessionSchema);

export default WorkSession;