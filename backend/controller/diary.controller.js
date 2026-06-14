import mongoose from "mongoose";
import Diary from "../models/diary.model.js";
import Note from "../models/note.model.js";
import Task from "../models/task.model.js";
import Habit from "../models/habit.model.js";
import Transaction from "../models/transaction.model.js";
import { errorHandler } from "../utilies/error.js";
import moment from "moment";

export const addDiaryEntry = async (req, res, next) => {
  const { title, content, mood, date, color, paperType, fontFamily, penColor, stickers, photos } = req.body;
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
      photos: photos || [],
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
  const { title, content, mood, date, color, paperType, fontFamily, penColor, stickers, photos } = req.body;
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
    if (photos !== undefined) entry.photos = photos;

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
    const noteCount = await Note.countDocuments({ userId, isTrashed: false, isArchived: false });
    const taskCount = await Task.countDocuments({ userId });
    const completedTaskCount = await Task.countDocuments({ userId, completed: true });
    const diaryCount = await Diary.countDocuments({ userId });

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

// Year in review / Monthly recap aggregator endpoint
export const getMonthlyRecap = async (req, res, next) => {
  const userId = req.user.id;
  const month = req.query.month || moment().format("YYYY-MM"); // YYYY-MM format

  try {
    const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
    const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();

    // 1. Diary entries count & most common mood
    const diaryEntries = await Diary.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const diaryCount = diaryEntries.length;
    const moodCounts = {};
    diaryEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    let mostCommonMood = "None";
    let maxMoodCount = 0;
    for (const mood in moodCounts) {
      if (moodCounts[mood] > maxMoodCount) {
        maxMoodCount = moodCounts[mood];
        mostCommonMood = mood;
      }
    }

    // 2. Tasks completed count (completed in the selected month)
    const completedTaskCount = await Task.countDocuments({
      userId,
      completed: true,
      $or: [
        { dueDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
      ]
    });

    // 3. Habit completions (dates matching the target YYYY-MM prefix)
    const habits = await Habit.find({ userId });
    let habitCompletions = 0;
    habits.forEach(habit => {
      if (habit.completedDates) {
        habit.completedDates.forEach(dateStr => {
          if (dateStr.startsWith(month)) {
            habitCompletions++;
          }
        });
      }
    });

    // 4. Money saved count (totalSavings from Transactions model)
    const savingsTransactions = await Transaction.find({
      userId,
      type: "saving",
      date: { $regex: `^${month}` }
    });
    const totalSaved = savingsTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      success: true,
      month,
      recap: {
        diaryCount,
        mostCommonMood,
        completedTaskCount,
        habitCompletions,
        totalSaved
      }
    });
  } catch (error) {
    next(error);
  }
};
