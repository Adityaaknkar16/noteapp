import Habit from "../models/habit.model.js";
import { errorHandler } from "../utilies/error.js";

// Helper function to calculate current streak
const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Deduplicate and sort dates descending
  const uniqueDates = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a));
  
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA');

  // If the last completion isn't today or yesterday, the streak is 0
  const latestDate = uniqueDates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(latestDate);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = currentDate.toLocaleDateString('en-CA');
    if (uniqueDates[i] === expectedStr) {
      streak++;
      // Move back by 1 day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const addHabit = async (req, res, next) => {
  const { title, description, color } = req.body;
  const { id } = req.user;

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }

  try {
    const habit = new Habit({
      title,
      description: description || "",
      color: color || "#3B82F6",
      userId: id,
    });

    await habit.save();

    res.status(201).json({
      success: true,
      message: "Habit added successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

export const getHabits = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    // Attach streaks dynamically
    const habitsWithStreaks = habits.map(habit => {
      const habitObj = habit.toObject();
      habitObj.streak = calculateStreak(habit.completedDates);
      return habitObj;
    });

    res.status(200).json({
      success: true,
      message: "Habits retrieved successfully",
      habits: habitsWithStreaks,
    });
  } catch (error) {
    next(error);
  }
};

export const editHabit = async (req, res, next) => {
  const { habitId } = req.params;
  const { title, description, color } = req.body;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return next(errorHandler(404, "Habit not found"));
    }

    if (title !== undefined) habit.title = title;
    if (description !== undefined) habit.description = description;
    if (color !== undefined) habit.color = color;

    await habit.save();

    const habitObj = habit.toObject();
    habitObj.streak = calculateStreak(habit.completedDates);

    res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      habit: habitObj,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  const { habitId } = req.params;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });

    if (!habit) {
      return next(errorHandler(404, "Habit not found"));
    }

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHabitDate = async (req, res, next) => {
  const { habitId } = req.params;
  const { date } = req.body; // YYYY-MM-DD
  const userId = req.user.id;

  if (!date) {
    return next(errorHandler(400, "Date is required"));
  }

  try {
    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return next(errorHandler(404, "Habit not found"));
    }

    const dateIndex = habit.completedDates.indexOf(date);
    if (dateIndex > -1) {
      // Remove date
      habit.completedDates.splice(dateIndex, 1);
    } else {
      // Add date
      habit.completedDates.push(date);
    }

    await habit.save();

    const habitObj = habit.toObject();
    habitObj.streak = calculateStreak(habit.completedDates);

    res.status(200).json({
      success: true,
      message: "Habit progress updated successfully",
      habit: habitObj,
    });
  } catch (error) {
    next(error);
  }
};
