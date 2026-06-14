import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "#3B82F6",
  },
  completedDates: {
    type: [String], // Dates stored as YYYY-MM-DD
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;
