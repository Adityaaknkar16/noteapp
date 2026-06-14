import mongoose from "mongoose";
import Diary from "../models/diary.model.js";
import { errorHandler } from "../utilies/error.js";

export const addDiaryEntry = async (req, res, next) => {
  const { title, content, mood, date, color, paperType, fontFamily, penColor, stickers } = req.body;
  const { id } = req.user;

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }
  if (!content) {
    return next(errorHandler(400, "Content is required"));
  }

  try {
    const entry = new Diary({
      title,
      content,
      mood: mood || "neutral",
      date: date || new Date(),
      color: color || "#ffffff",
      paperType: paperType || "plain",
      fontFamily: fontFamily || "Outfit",
      penColor: penColor || "#1e293b",
      stickers: stickers || [],
      userId: id,
    });

    await entry.save();

    res.status(201).json({
      success: true,
      message: "Diary entry added successfully",
      entry,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiaryEntries = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const entries = await Diary.find({ userId }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Diary entries retrieved successfully",
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const editDiaryEntry = async (req, res, next) => {
  const { entryId } = req.params;
  const { title, content, mood, date, color, paperType, fontFamily, penColor, stickers } = req.body;
  const userId = req.user.id;

  try {
    const entry = await Diary.findOne({ _id: entryId, userId });

    if (!entry) {
      return next(errorHandler(404, "Diary entry not found"));
    }

    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (mood !== undefined) entry.mood = mood;
    if (date !== undefined) entry.date = date;
    if (color !== undefined) entry.color = color;
    if (paperType !== undefined) entry.paperType = paperType;
    if (fontFamily !== undefined) entry.fontFamily = fontFamily;
    if (penColor !== undefined) entry.penColor = penColor;
    if (stickers !== undefined) entry.stickers = stickers;

    await entry.save();

    res.status(200).json({
      success: true,
      message: "Diary entry updated successfully",
      entry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiaryEntry = async (req, res, next) => {
  const { entryId } = req.params;
  const userId = req.user.id;

  try {
    const entry = await Diary.findOneAndDelete({ _id: entryId, userId });

    if (!entry) {
      return next(errorHandler(404, "Diary entry not found"));
    }

    res.status(200).json({
      success: true,
      message: "Diary entry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getStats = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const noteCount = await mongoose.model("Note").countDocuments({ userId, isTrashed: false, isArchived: false });
    const taskCount = await mongoose.model("Task").countDocuments({ userId });
    const completedTaskCount = await mongoose.model("Task").countDocuments({ userId, completed: true });
    const diaryCount = await mongoose.model("Diary").countDocuments({ userId });

    res.status(200).json({
      success: true,
      stats: {
        noteCount,
        taskCount,
        completedTaskCount,
        diaryCount,
      }
    });
  } catch (error) {
    next(error);
  }
};
