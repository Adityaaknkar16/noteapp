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

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"], credentials: true }));
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
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});