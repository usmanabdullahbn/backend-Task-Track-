import mongoose from 'mongoose';

const idleLogSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },
  sessionId: mongoose.Schema.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number
});

// Performance index
idleLogSchema.index({ sessionId: 1 });

const IdleLog = mongoose.model('IdleLog', idleLogSchema);

export default IdleLog;