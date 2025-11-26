import mongoose from "mongoose"
import { ASSET_STATUS } from "../config/constants.js"

const assetSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: [true, "Please provide a Order ID"],
    
  },
  project_id: {
    type: String,
    required: [true, "Please provide a project ID"],
  },
  customer_id: {
    type: String,
    required: [true, "Please provide a Customer ID"],
  },
  title: {
    type: String,
    required: [true, "Please provide an asset title"],
    trim: true,
  },
  description: String,
  model: String,
  manufacturer: String,
  serial_number: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
    type: String,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
  },
  file_upload: String,
  status: {
    type: String,
    enum: ASSET_STATUS,
    default: "Active",
  },
  location: String,
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

export default mongoose.model("Asset", assetSchema)
