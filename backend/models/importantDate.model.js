import mongoose from "mongoose";

const importantDateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String, // MM-DD or YYYY-MM-DD
    required: true,
  },
  type: {
    type: String,
    enum: ["birthday", "anniversary", "festival", "other"],
    required: true,
  },
  isYearlyRecurring: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ImportantDate = mongoose.model("ImportantDate", importantDateSchema);
export default ImportantDate;
