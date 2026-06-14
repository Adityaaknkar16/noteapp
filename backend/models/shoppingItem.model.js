import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema({
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
    default: "Other", // e.g. "Vegetables", "Dairy", "Household", "Other"
  },
  quantity: {
    type: String,
    default: "", // e.g. "2 kg"
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ShoppingItem = mongoose.model("ShoppingItem", shoppingItemSchema);
export default ShoppingItem;
