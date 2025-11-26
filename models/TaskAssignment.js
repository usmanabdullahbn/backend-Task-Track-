import mongoose from "mongoose"

const taskAssignmentSchema = new mongoose.Schema({
  task_id: {
    type: String,
    ref: "Task",
    required: [true, "Please provide a task"],
  },
  employee_id: {
    type: String,
    ref: "Employee",
    required: [true, "Please provide an employee"],
  },
  assigned_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Assigned", "In Progress", "Completed", "Pending"],
    default: "Assigned",
  },
  notes: String,
  hours_spent: Number,
  actual_completion_date: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("TaskAssignment", taskAssignmentSchema)
