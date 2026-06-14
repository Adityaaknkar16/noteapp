import mongoose from "mongoose";

const drawingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Sketch",
  },
  imageData: {
    type: String,
    required: true, // base64 PNG data URI
  },
  background: {
    type: String,
    default: "plain", // plain, ruled, grid, dotted
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// NOTE: Storing sketches as base64 in MongoDB is acceptable for this phase,
// but for production scale, these should be uploaded to a file storage service (e.g. AWS S3, Cloudinary).

const Drawing = mongoose.model("Drawing", drawingSchema);
export default Drawing;
