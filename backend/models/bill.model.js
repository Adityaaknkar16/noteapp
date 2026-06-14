import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  category: {
    type: String,
    default: "Other", // e.g. "Electricity", "Rent", "School Fees", "EMI", "Other"
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrenceInterval: {
    type: String,
    enum: ["monthly", "yearly", null],
    default: null,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
