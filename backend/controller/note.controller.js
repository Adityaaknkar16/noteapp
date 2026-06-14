import { json } from "express";
import Note from "../models/note.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utilies/error.js"
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"

export const addNote = async (req, res, next) => {
  const { title, content, tags, color, paperType, fontFamily, penColor, stickers } = req.body;
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
      color: color || "#ffffff",
      paperType: paperType || "plain",
      fontFamily: fontFamily || "Outfit",
      penColor: penColor || "#1e293b",
      stickers: stickers || [],
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

    const currentUser = await User.findById(req.user.id);
    const userEmail = currentUser ? currentUser.email : "";

    if (req.user.id !== note.userId && !note.collaborators.includes(userEmail)) {
      return next(errorHandler(401, "You can only update notes you own or collaborate on"));
    }

    const { title, content, tags, isPinned, color, isArchived, isTrashed, paperType, fontFamily, penColor, stickers } = req.body;

    if (!title && !content && !tags && typeof isPinned === "undefined" && typeof color === "undefined" && typeof isArchived === "undefined" && typeof isTrashed === "undefined" && !paperType && !fontFamily && !penColor && !stickers) {
      return next(errorHandler(404, "No changes provided"));
    }

    // Update fields if they are provided
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== "undefined") note.isPinned = isPinned;
    if (typeof color !== "undefined") note.color = color;
    if (typeof isArchived !== "undefined") note.isArchived = isArchived;
    if (typeof isTrashed !== "undefined") note.isTrashed = isTrashed;
    if (paperType) note.paperType = paperType;
    if (fontFamily) note.fontFamily = fontFamily;
    if (penColor) note.penColor = penColor;
    if (stickers) note.stickers = stickers;

    // Track editing user
    if (currentUser) {
      note.lastEditedBy = currentUser.username;
    }

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
  const userId = req.user.id;
  const { filter, tag } = req.query;

  try {
    const currentUser = await User.findById(userId);
    const userEmail = currentUser ? currentUser.email : "";

    let conditions = [];
    conditions.push({
      $or: [
        { userId: userId },
        { collaborators: userEmail }
      ]
    });

    if (filter === "archive") {
      conditions.push({ isArchived: true, isTrashed: false });
    } else if (filter === "trash") {
      conditions.push({ isTrashed: true });
    } else {
      conditions.push({ isArchived: false, isTrashed: false });
    }

    if (tag) {
      conditions.push({ tags: tag });
    }

    const notes = await Note.find({ $and: conditions }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Notes retrieved successfully",
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteCollaborator = async (req, res, next) => {
  const { noteId } = req.params;
  const { email } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    if (note.userId !== req.user.id) {
      return next(errorHandler(403, "Only the owner can invite collaborators"));
    }

    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    const collaboratorUser = await User.findOne({ email });
    if (!collaboratorUser) {
      return next(errorHandler(404, "User with this email not found"));
    }

    if (note.collaborators.includes(email)) {
      return next(errorHandler(400, "User is already a collaborator"));
    }

    note.collaborators.push(email);
    await note.save();

    res.status(200).json({
      success: true,
      message: `${email} successfully added as a collaborator`,
      note
    });
  } catch (error) {
    next(error);
  }
};


export const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    if (note.isTrashed) {
      // Hard delete
      await Note.deleteOne({ _id: noteId, userId: req.user.id });
      res.status(200).json({
        success: true,
        message: "Note deleted permanently"
      });
    } else {
      // Soft delete
      note.isTrashed = true;
      note.isPinned = false;
      await note.save();
      res.status(200).json({
        success: true,
        message: "Note moved to Trash"
      });
    }

  } catch (error) {
    next(error);
  }
};



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