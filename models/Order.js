import mongoose from "mongoose";
import { ORDER_STATUS } from "../config/constants.js";

const orderSchema = new mongoose.Schema({
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

  user: {
    id: {
      type: String,
      required: [true, "Please provide a user Id"],
    },
    name: {
      type: String,
      required: [true, "Please provide a user name"],
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
    title: {
    type: String,
    required: [true, "Please provide an title"],
  },

  order_number: {
    type: String,
    required: [true, "Please provide an order number"],
    // unique: true,
  },
  erp_number: {
    type: String,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, "Please provide an amount"],
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  delivery_date: Date,
  file_upload: String,
  public_link: String,
  status: {
    type: String,
    enum: ORDER_STATUS,
    default: "Pending",
  },
  notes: String,
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
});

export default mongoose.model("Order", orderSchema);
