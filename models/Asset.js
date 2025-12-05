import mongoose from "mongoose"
import { ASSET_STATUS } from "../config/constants.js"

const assetSchema = new mongoose.Schema({
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

  //  order: {
  //   id: {
  //     type: String,
  //     // required: [true, "Please provide a order Id"],
  //   },
  //   order_number: {
  //     type: String,
  //     // required: [true, "Please provide a order number"],
  //   },
  // },

  // task: {
  //   id: {
  //     type: String,
  //     // required: [true, "Please provide a task Id"],
  //   },
  //   name: {
  //     type: String,
  //     // required: [true, "Please provide a task name"],
  //   },
  // },
 
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
    // required: [true, "Please provide an barcode"],

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
