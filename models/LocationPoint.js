import mongoose from 'mongoose';

const locationPointSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },
  sessionId: mongoose.Schema.Types.ObjectId,
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  speed: Number,
  locationName: String,
  timeFormatted: String,
  locationType: { type: String, enum: ['regular', 'start', 'idle'], default: 'regular' } // FIX #5: Mark location type
});

// Performance indexes
locationPointSchema.index({ sessionId: 1, timestamp: 1 });
locationPointSchema.index({ workerId: 1, timestamp: 1 });

// Optional: Auto-delete after 1 year (31536000 seconds)
locationPointSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const LocationPoint = mongoose.model('LocationPoint', locationPointSchema);

export default LocationPoint;