import Subject from "../models/subject.model.js";
import Event from "../models/event.model.js";
import { errorHandler } from "../utilies/error.js";

// Subjects CRUD
export const addSubject = async (req, res, next) => {
  const { name, color, performance, icon } = req.body;
  const userId = req.user.id;

  if (!name) {
    return next(errorHandler(400, "Subject name is required"));
  }

  try {
    const subject = new Subject({
      name,
      color: color || "#3B82F6",
      performance: performance || 0,
      icon: icon || "book",
      userId,
    });

    await subject.save();

    res.status(201).json({
      success: true,
      message: "Subject added successfully",
      subject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const subjects = await Subject.find({ userId }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Subjects retrieved successfully",
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

export const addGradeToSubject = async (req, res, next) => {
  const { subjectId } = req.params;
  const { grade } = req.body; // e.g. 9.23
  const userId = req.user.id;

  if (grade === undefined || isNaN(grade)) {
    return next(errorHandler(400, "Valid grade value is required"));
  }

  try {
    const subject = await Subject.findOne({ _id: subjectId, userId });

    if (!subject) {
      return next(errorHandler(404, "Subject not found"));
    }

    subject.grades.push(Number(grade));

    // Calculate a mock performance percentage based on whether the last grade was better or worse than average
    if (subject.grades.length > 1) {
      const allExceptLast = subject.grades.slice(0, -1);
      const avgBefore = allExceptLast.reduce((a, b) => a + b, 0) / allExceptLast.length;
      const pctChange = ((Number(grade) - avgBefore) / (avgBefore || 1)) * 100;
      subject.performance = Math.round(pctChange);
    } else {
      subject.performance = 0;
    }

    await subject.save();

    res.status(200).json({
      success: true,
      message: "Grade added successfully",
      subject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  const { subjectId } = req.params;
  const userId = req.user.id;

  try {
    const subject = await Subject.findOneAndDelete({ _id: subjectId, userId });

    if (!subject) {
      return next(errorHandler(404, "Subject not found"));
    }

    // Also clean up any associated calendar events
    await Event.deleteMany({ subjectId, userId });

    res.status(200).json({
      success: true,
      message: "Subject and associated events deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Events CRUD
export const addEvent = async (req, res, next) => {
  const { title, subjectId, dayOfWeek, startTime, endTime, location, instructor } = req.body;
  const userId = req.user.id;

  if (!title || !dayOfWeek || !startTime || !endTime) {
    return next(errorHandler(400, "Title, day, start and end times are required"));
  }

  try {
    const event = new Event({
      title,
      subjectId: subjectId || null,
      dayOfWeek,
      startTime,
      endTime,
      location: location || "",
      instructor: instructor || "",
      userId,
    });

    await event.save();

    // Populate subject if ref exists
    if (subjectId) {
      await event.populate("subjectId");
    }

    res.status(201).json({
      success: true,
      message: "Event scheduled successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const events = await Event.find({ userId }).populate("subjectId").sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      events,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await Event.findOneAndDelete({ _id: eventId, userId });

    if (!event) {
      return next(errorHandler(404, "Event not found"));
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
