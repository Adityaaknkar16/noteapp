import Note from "../models/note.model.js";
import { errorHandler } from "../utilies/error.js"
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"

export const addNote = async (req, res, next) => {
  const { title, content, tags } = req.body;
  const { id } = req.user;

  if (!id) {
    return next(errorHandler(401, "User not authenticated"));
  }

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }

  if (!content) {
    return next(errorHandler(400, "Content is required"));
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: id,
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: "Note added Successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};