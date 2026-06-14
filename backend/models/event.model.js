import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
  },
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  startTime: {
    type: String, // HH:MM format (24 hour) e.g., "08:00"
    required: true,
  },
  endTime: {
    type: String, // HH:MM format (24 hour) e.g., "09:30"
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  instructor: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
