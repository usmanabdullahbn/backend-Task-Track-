import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a customer name"],
    trim: true,
  },
  address: String,
  phone: String,
  fax: String,
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide a customer name"],
    match: [/^[\w.-]+@[\w.-]+\.\w+$/, "Please provide a valid email"],
  },
  latitude: mongoose.Schema.Types.Decimal128,
  longitude: mongoose.Schema.Types.Decimal128,
  password: {
    type: String,
    required: true,
  },

  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);
