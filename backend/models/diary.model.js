import mongoose from "mongoose";

const diarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ["happy", "neutral", "sad", "productive", "tired"],
    default: "neutral",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#ffffff",
  },
  paperType: {
    type: String,
    default: "plain",
  },
  fontFamily: {
    type: String,
    default: "Outfit",
  },
  penColor: {
    type: String,
    default: "#1e293b",
  },
  stickers: {
     type: [String],
     default: [],
  },

  // Base64 photos array support
  // NOTE: In production with many users, these should move to proper file storage (e.g. Cloudinary)
  photos: {
    type: [String],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Diary = mongoose.model("Diary", diarySchema);
export default Diary;
