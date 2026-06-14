import { json } from "express";
import Note from "../models/note.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utilies/error.js"
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto";

export const addNote = async (req, res, next) => {
  const { title, content, tags, color, paperType, fontFamily, penColor, stickers, voiceNotes, sketches } = req.body;
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
      voiceNotes: voiceNotes || [],
      sketches: sketches || [],
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

    const { title, content, tags, isPinned, color, isArchived, isTrashed, paperType, fontFamily, penColor, stickers, voiceNotes, sketches } = req.body;

    if (!title && !content && !tags && typeof isPinned === "undefined" && typeof color === "undefined" && typeof isArchived === "undefined" && typeof isTrashed === "undefined" && !paperType && !fontFamily && !penColor && !stickers && !voiceNotes && !sketches) {
      return next(errorHandler(400, "No changes provided"));
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
    if (voiceNotes) note.voiceNotes = voiceNotes;
    if (sketches) note.sketches = sketches;

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

    // Retrieve all notes, but sanitize pinHash out from the response
    const notes = await Note.find({ $and: conditions }).sort({ isPinned: -1, createdAt: -1 });

    const sanitizedNotes = notes.map(note => {
      const noteObj = note.toObject();
      delete noteObj.pinHash;
      return noteObj;
    });

    res.status(200).json({
      success: true,
      message: "Notes retrieved successfully",
      notes: sanitizedNotes,
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

    const sanitizedNotes = notes.map(note => {
      const noteObj = note.toObject();
      delete noteObj.pinHash;
      return noteObj;
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Search completed successfully",
      notes: sanitizedNotes 
    });
  } catch (error) {
    next(error);
  }
};

// PIN management endpoints
export const setNotePin = async (req, res, next) => {
  const { noteId } = req.params;
  const { pin } = req.body;
  const userId = req.user.id;

  if (!pin || pin.length !== 4) {
    return next(errorHandler(400, "A 4-digit PIN is required"));
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    const salt = await bcryptjs.genSalt(10);
    const pinHash = await bcryptjs.hash(pin, salt);

    note.isLocked = true;
    note.pinHash = pinHash;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note PIN locked successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const removeNotePin = async (req, res, next) => {
  const { noteId } = req.params;
  const { pin } = req.body;
  const userId = req.user.id;

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    if (note.pinHash) {
      if (!pin) {
        return next(errorHandler(400, "Current PIN is required to unlock"));
      }
      const isMatch = await bcryptjs.compare(pin, note.pinHash);
      if (!isMatch) {
        return next(errorHandler(403, "Incorrect PIN"));
      }
    }

    note.isLocked = false;
    note.pinHash = null;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note unlocked and PIN removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const verifyNotePin = async (req, res, next) => {
  const { noteId } = req.params;
  const { pin } = req.body;
  const userId = req.user.id;

  if (!pin) {
    return next(errorHandler(400, "PIN is required"));
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    // Check collaborators check
    const currentUser = await User.findById(userId);
    const userEmail = currentUser ? currentUser.email : "";
    if (note.userId !== userId && !note.collaborators.includes(userEmail)) {
      return next(errorHandler(403, "Unauthorized access to note"));
    }

    const isMatch = await bcryptjs.compare(pin, note.pinHash);
    if (!isMatch) {
      return next(errorHandler(403, "Incorrect PIN"));
    }

    // Sanitize pinHash out when returning note details
    const noteObj = note.toObject();
    delete noteObj.pinHash;

    res.status(200).json({
      success: true,
      message: "PIN verified successfully",
      note: noteObj
    });
  } catch (error) {
    next(error);
  }
};

// Shareable read-only link endpoints
export const generateShareLink = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    const token = crypto.randomBytes(16).toString("hex");
    note.shareToken = token;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Share link generated successfully",
      shareToken: token
    });
  } catch (error) {
    next(error);
  }
};

export const revokeShareLink = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    note.shareToken = null;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Share link revoked successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Unauthenticated endpoint for shared notes
export const getSharedNote = async (req, res, next) => {
  const { token } = req.params;

  try {
    const note = await Note.findOne({ shareToken: token });
    if (!note || note.isTrashed || note.isArchived) {
      return next(errorHandler(404, "Shared note not found or has been revoked"));
    }

    if (note.isLocked) {
      return next(errorHandler(403, "This shared note is locked and cannot be viewed publicly"));
    }

    // Return ONLY title, content, color, paperType, fontFamily, penColor, stickers, voiceNotes
    res.status(200).json({
      success: true,
      note: {
        title: note.title,
        content: note.content,
        color: note.color,
        paperType: note.paperType,
        fontFamily: note.fontFamily,
        penColor: note.penColor,
        stickers: note.stickers,
        voiceNotes: note.voiceNotes
      }
    });
  } catch (error) {
    next(error);
  }
};