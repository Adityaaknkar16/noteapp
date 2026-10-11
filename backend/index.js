import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";
import taskRouter from "./routes/task.route.js";
import diaryRouter from "./routes/diary.route.js";
import habitRouter from "./routes/habit.route.js";
import academicRouter from "./routes/academic.route.js";
import budgetRouter from "./routes/budget.route.js";
import shoppingRouter from "./routes/shoppingItem.route.js";
import pantryRouter from "./routes/pantryItem.route.js";
import billRouter from "./routes/bill.route.js";
import importantDateRouter from "./routes/importantDate.route.js";
import drawingRouter from "./routes/drawing.route.js";

dotenv.config();

const app = express();

// Trust reverse proxies (Railway, Vercel, Render) so Express knows requests are HTTPS for secure cookies
app.set("trust proxy", 1);

// Database connection logic compatible with both long-running servers and serverless environments
const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;

let cachedDbPromise = null;
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!mongoUri) {
    console.error("CRITICAL: Neither MONGO_URL nor MONGODB_URI is defined in environment variables!");
    return null;
  }
  if (!cachedDbPromise) {
    cachedDbPromise = mongoose
      .connect(mongoUri)
      .then((conn) => {
        console.log("Connected to MongoDB successfully");
        return conn;
      })
      .catch((err) => {
        cachedDbPromise = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }
  return cachedDbPromise;
};

// Initial connection attempt on boot
connectDB().catch((err) => {
  console.warn("Initial DB connection warning (will retry on first request):", err.message);
});

// Middleware to ensure DB connection is ready on each request in serverless
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1 && mongoUri) {
    try {
      await connectDB();
    } catch (err) {
      console.error("Failed to establish MongoDB connection on request:", err.message);
    }
  }
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());

// Build comprehensive allowed origins list with trailing slashes stripped
const rawOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://noteapp-mu-ashy.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

const parseOrigins = (list) => {
  const set = new Set();
  list.filter(Boolean).forEach((entry) => {
    entry.split(",").forEach((item) => {
      const clean = item.trim().replace(/\/+$/, "");
      if (clean) set.add(clean);
    });
  });
  return Array.from(set);
};

const allowedOrigins = parseOrigins(rawOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl, Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "x-auth-token"],
  })
);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    dbState: mongoose.connection.readyState, // 1 = connected
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Inkwell API Server is running");
});

// App routes
app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);
app.use("/api/task", taskRouter);
app.use("/api/diary", diaryRouter);
app.use("/api/habit", habitRouter);
app.use("/api/academic", academicRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/shopping", shoppingRouter);
app.use("/api/pantry", pantryRouter);
app.use("/api/bill", billRouter);
app.use("/api/important-date", importantDateRouter);
app.use("/api/drawing", drawingRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

export default app;

// Listen on port only if running standalone (not in a serverless function export like Vercel)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}