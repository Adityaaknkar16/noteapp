import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#3B82F6",
  },
  grades: {
    type: [Number],
    default: [],
  },
  performance: {
    type: Number,
    default: 0, // performance percentage change, e.g. +3 or -1
  },
  icon: {
    type: String,
    default: "book",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
