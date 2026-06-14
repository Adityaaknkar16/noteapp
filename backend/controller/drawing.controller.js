import Drawing from "../models/drawing.model.js";
import { errorHandler } from "../utilies/error.js";

// Add a new drawing
export const addDrawing = async (req, res, next) => {
  const { title, imageData, background } = req.body;
  const userId = req.user.id;

  if (!imageData) {
    return next(errorHandler(400, "Image data is required"));
  }

  try {
    const drawing = new Drawing({
      userId,
      title: title || "Untitled Sketch",
      imageData,
      background: background || "plain"
    });

    await drawing.save();

    res.status(201).json({
      success: true,
      message: "Drawing saved successfully",
      drawing
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all drawings for the logged-in user
export const getAllDrawings = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const drawings = await Drawing.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      drawings
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a single drawing by ID
export const getDrawingById = async (req, res, next) => {
  const { drawingId } = req.params;
  const userId = req.user.id;

  try {
    const drawing = await Drawing.findOne({ _id: drawingId, userId });

    if (!drawing) {
      return next(errorHandler(404, "Drawing not found"));
    }

    res.status(200).json({
      success: true,
      drawing
    });
  } catch (error) {
    next(error);
  }
};

// Edit/update a drawing
export const editDrawing = async (req, res, next) => {
  const { drawingId } = req.params;
  const { title, imageData, background } = req.body;
  const userId = req.user.id;

  try {
    const drawing = await Drawing.findOne({ _id: drawingId, userId });

    if (!drawing) {
      return next(errorHandler(404, "Drawing not found"));
    }

    if (title !== undefined) drawing.title = title;
    if (imageData !== undefined) drawing.imageData = imageData;
    if (background !== undefined) drawing.background = background;
    drawing.updatedAt = Date.now();

    await drawing.save();

    res.status(200).json({
      success: true,
      message: "Drawing updated successfully",
      drawing
    });
  } catch (error) {
    next(error);
  }
};

// Delete a drawing
export const deleteDrawing = async (req, res, next) => {
  const { drawingId } = req.params;
  const userId = req.user.id;

  try {
    const drawing = await Drawing.findOneAndDelete({ _id: drawingId, userId });

    if (!drawing) {
      return next(errorHandler(404, "Drawing not found"));
    }

    res.status(200).json({
      success: true,
      message: "Drawing deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
