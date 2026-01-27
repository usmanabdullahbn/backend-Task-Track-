import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    title: String,
    time : String,
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const OfficeSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    title: String,
  },
  { _id: false }
);

const EmployeeTimelineSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // yyyy-mm-dd
      required: true,
    },
    office: OfficeSchema,
    tasks: [TaskSchema],
  },
  { timestamps: true }
);

export default mongoose.model(
  "EmployeeTimeline",
  EmployeeTimelineSchema
);
