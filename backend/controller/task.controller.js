import Task from "../models/task.model.js";
import { errorHandler } from "../utilies/error.js";

export const addTask = async (req, res, next) => {
  const { title, priority, dueDate } = req.body;
  const { id } = req.user;

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }

  try {
    const task = new Task({
      title,
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId: id,
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  const userId = req.user.id;
  const { filter } = req.query; // 'pending', 'completed', 'all'

  try {
    let query = { userId };
    if (filter === "pending") {
      query.completed = false;
    } else if (filter === "completed") {
      query.completed = true;
    }

    const tasks = await Task.find(query).sort({ completed: 1, dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const editTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, completed, priority, dueDate } = req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return next(errorHandler(404, "Task not found"));
    }

    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      return next(errorHandler(404, "Task not found"));
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
