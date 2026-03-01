import mongoose from 'mongoose';

const taskVisitSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },
  sessionId: mongoose.Schema.Types.ObjectId,
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  latitude: Number,
  longitude: Number,
  startTime: Date,
  endTime: Date,
  leftTime: Date,               // when worker left task location unexpectedly
  leftLatitude: Number,
  leftLongitude: Number,
  duration: Number
});

// Performance index
taskVisitSchema.index({ sessionId: 1 });

const TaskVisit = mongoose.model('TaskVisit', taskVisitSchema);

export default TaskVisit;