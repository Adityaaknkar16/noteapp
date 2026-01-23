import { json } from "express";
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
export const editNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    if (req.user.id !== note.userId) {
      return next(errorHandler(401, "You can only update your note"));
    }

    const { title, content, tags, isPinned } = req.body;

    if (!title && !content && !tags && typeof isPinned === "undefined") {
      return next(errorHandler(404, "No changes provided"));
    }

    // Update fields if they are provided
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== "undefined") note.isPinned = isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllNotes = async (req, res, next) => {
  const userId = req.user.id

  try {
    const notes = await Note.find({ userId: userId }).sort({ isPinned: -1 })

    res.status(200).json({
      success: true,
      message: "All notes retrived successfully",
      notes,
    })
  } catch (error) {
    next(error)
  }
}


export const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    await Note.deleteOne({ _id: noteId, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Note is deleted"
    });

  } catch (error) {
    next(error);
  }
}



export const updatenotepinned = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    if (req.user.id !== note.userId) {
      return next(errorHandler(403, "You can only update your own note"));
    }

    const { isPinned } = req.body;

    if (typeof isPinned === "undefined") {
      return next(errorHandler(400, "Missing isPinned value"));
    }

    note.isPinned = isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};
export const searchNotes = async (req, res, next) => {
  const { query } = req.query;
  const userId = req.user.id;
  
  if (!query) {
    return next(errorHandler(400, "Search query is required"));
  }
  
  try {
    const notes = await Note.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ]
    }).sort({ isPinned: -1 });
    
    res.status(200).json({ 
      success: true, 
      message: "Search completed successfully",
      notes 
    });
  } catch (error) {
    next(error);
  }
};