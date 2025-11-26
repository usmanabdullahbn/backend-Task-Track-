import mongoose from "mongoose"
import { PROJECT_STATUS } from "../config/constants.js"

const projectSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: [true, "Please provide a customer"],
  },
  title: {
    type: String,
    required: [true, "Please provide a project title"],
    trim: true,
  },
  map_location: String,
  contact_name: String,
  contact_phone: String,
  contact_email: String,
  description: String,
  file_upload: String,
  latitude: mongoose.Schema.Types.Decimal128,
  longitude: mongoose.Schema.Types.Decimal128,
  status: {
    type: String,
    enum: PROJECT_STATUS,
    default: "Active",
  },
  start_date: Date,
  end_date: Date,
  budget: mongoose.Schema.Types.Decimal128,
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

export default mongoose.model("Project", projectSchema)
