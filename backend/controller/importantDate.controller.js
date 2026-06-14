import ImportantDate from "../models/importantDate.model.js";
import { errorHandler } from "../utilies/error.js";
import moment from "moment";

export const addImportantDate = async (req, res, next) => {
  const { title, date, type, isYearlyRecurring, notes } = req.body;
  const userId = req.user.id;

  if (!title || !date || !type) {
    return next(errorHandler(400, "Title, date, and type are required"));
  }

  try {
    const importantDate = new ImportantDate({
      userId,
      title,
      date,
      type,
      isYearlyRecurring: isYearlyRecurring !== undefined ? !!isYearlyRecurring : true,
      notes: notes || "",
    });

    await importantDate.save();

    res.status(201).json({
      success: true,
      message: "Important date added successfully",
      importantDate,
    });
  } catch (error) {
    next(error);
  }
};

export const getImportantDates = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const importantDates = await ImportantDate.find({ userId }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      message: "Important dates retrieved successfully",
      importantDates,
    });
  } catch (error) {
    next(error);
  }
};

export const editImportantDate = async (req, res, next) => {
  const { dateId } = req.params;
  const { title, date, type, isYearlyRecurring, notes } = req.body;
  const userId = req.user.id;

  try {
    const importantDate = await ImportantDate.findOne({ _id: dateId, userId });
    if (!importantDate) {
      return next(errorHandler(404, "Important date not found"));
    }

    if (title !== undefined) importantDate.title = title;
    if (date !== undefined) importantDate.date = date;
    if (type !== undefined) importantDate.type = type;
    if (isYearlyRecurring !== undefined) importantDate.isYearlyRecurring = !!isYearlyRecurring;
    if (notes !== undefined) importantDate.notes = notes;

    await importantDate.save();

    res.status(200).json({
      success: true,
      message: "Important date updated successfully",
      importantDate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImportantDate = async (req, res, next) => {
  const { dateId } = req.params;
  const userId = req.user.id;

  try {
    const importantDate = await ImportantDate.findOneAndDelete({ _id: dateId, userId });
    if (!importantDate) {
      return next(errorHandler(404, "Important date not found"));
    }

    res.status(200).json({
      success: true,
      message: "Important date deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingDates = async (req, res, next) => {
  const userId = req.user.id;
  const today = moment().startOf("day");

  try {
    const allDates = await ImportantDate.find({ userId });
    const upcoming = [];

    allDates.forEach((item) => {
      // Parse dates of format YYYY-MM-DD or MM-DD
      const dateParts = item.date.split("-");
      let itemDate;
      if (dateParts.length === 2) {
        // MM-DD format, set default current year
        itemDate = moment(`${moment().year()}-${item.date}`, "YYYY-MM-DD");
      } else {
        itemDate = moment(item.date, "YYYY-MM-DD");
      }

      if (!itemDate.isValid()) return;

      let targetDate = itemDate.clone().year(today.year());

      if (item.isYearlyRecurring) {
        // Check if occurrence this year has passed. If so, look at next year.
        if (targetDate.isBefore(today, "day")) {
          targetDate.add(1, "year");
        }
      }

      const diff = targetDate.diff(today, "days");

      // Check if it occurs in the next 30 days
      if (diff >= 0 && diff <= 30) {
        upcoming.push({
          ...item.toObject(),
          daysRemaining: diff,
          upcomingDate: targetDate.format("YYYY-MM-DD")
        });
      }
    });

    // Sort by days remaining ascending
    upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.status(200).json({
      success: true,
      message: "Upcoming dates retrieved successfully",
      importantDates: upcoming,
    });
  } catch (error) {
    next(error);
  }
};
