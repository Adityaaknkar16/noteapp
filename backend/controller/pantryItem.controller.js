import PantryItem from "../models/pantryItem.model.js";
import { errorHandler } from "../utilies/error.js";

export const addPantryItem = async (req, res, next) => {
  const { name, category, quantity, unit, lowStockThreshold } = req.body;
  const userId = req.user.id;

  if (!name || quantity === undefined) {
    return next(errorHandler(400, "Item name and quantity are required"));
  }

  try {
    const item = new PantryItem({
      userId,
      name,
      category: category || "Other",
      quantity: Number(quantity),
      unit: unit || "pcs",
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 1,
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: "Pantry item added successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const getPantryItems = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const items = await PantryItem.find({ userId }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Pantry items retrieved successfully",
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const editPantryItem = async (req, res, next) => {
  const { itemId } = req.params;
  const { name, category, quantity, unit, lowStockThreshold } = req.body;
  const userId = req.user.id;

  try {
    const item = await PantryItem.findOne({ _id: itemId, userId });
    if (!item) {
      return next(errorHandler(404, "Pantry item not found"));
    }

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit !== undefined) item.unit = unit;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

    await item.save();

    res.status(200).json({
      success: true,
      message: "Pantry item updated successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePantryItem = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const item = await PantryItem.findOneAndDelete({ _id: itemId, userId });
    if (!item) {
      return next(errorHandler(404, "Pantry item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Pantry item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Find where quantity <= lowStockThreshold
    const items = await PantryItem.find({
      userId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Low stock items retrieved successfully",
      items,
    });
  } catch (error) {
    next(error);
  }
};
