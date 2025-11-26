import mongoose from "mongoose";
import { EMPLOYEE_STATUS, ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a User name"],

  },

  email: {
    type: String,
    unique: true,
    required: [true, "Please provide a User name"],
    match: [/^[\w.-]+@[\w.-]+\.\w+$/, "Please provide a valid email"],
  },

  password: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: [true, "Please provide a designation"],
  },
  role: {
    type: String,
    enum: ROLES,
    required: [
      true,
      "Please provide a Role [Admin, Manager, Supervisor, Worker]",
    ],
  },

  asset_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  // task_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Task",
  // },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },

  code: {
    type: String,
    // unique: true,
  },
  phone: String,
  status: {
    type: String,
    enum: EMPLOYEE_STATUS,
    default: "Active",
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
