import mongoose from "mongoose"
import { TASK_STATUS, TASK_PRIORITY } from "../config/constants.js"

const taskSchema = new mongoose.Schema({
customer: {
    id: {
      type: String,
      required: [true, "Please provide a customer Id"],
    },
    name: {
      type: String,
      required: [true, "Please provide a customer name"],
    },
  },
    employee: {
    id: {
      type: String,
      // required: [true, "Please provide a empoloyee Id"],
    },
    name: {
      type: String,
      // required: [true, "Please provide a empoloyee name"],
    },
  },

  user: {
    id: {
      type: String,
      required: [true, "Please provide a empoloyee Id"],
    },
    name: {
      type: String,
      required: [true, "Please provide a empoloyee name"],
    },
  },
  project: {
    id: {
      type: String,
      required: [true, "Please provide a project Id"],
    },
    name: {
      type: String,
      required: [true, "Please provide a project name"],
    },
  },
  asset: {
    id: {
      type: String,
      required: [true, "Please provide a asset Id"],
    },
    name: {
      type: String,
      required: [true, "Please provide a asset name"],
    },
  },
  order: {
    id: {
      type: String,
      required: [true, "Please provide a order Id"],
    },
    title: {
      type: String,
      required: [true, "Please provide a order name"],
    },
  },

  title: {
    type: String,
    required: [true, "Please provide a task title"],
  },
  description: String,
  plan_duration: Number,
  start_time: Date,
  end_time: Date,
  actual_start_time: Date,
  actual_end_time: Date,
  file_upload: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  }],
  priority: {
    type: String,
    enum: TASK_PRIORITY,
    default: "Medium",
  },
  status: {
    type: String,
    enum: TASK_STATUS,
    default: "Todo",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  percentage_complete: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
  created_user: String,
  modified_user: String,
})

export default mongoose.model("Task", taskSchema)
