import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "Other",
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    default: "pcs", // e.g. "kg", "pcs", "liters"
  },
  lowStockThreshold: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PantryItem = mongoose.model("PantryItem", pantryItemSchema);
export default PantryItem;
