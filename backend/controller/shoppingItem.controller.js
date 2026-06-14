import ShoppingItem from "../models/shoppingItem.model.js";
import { errorHandler } from "../utilies/error.js";

export const addShoppingItem = async (req, res, next) => {
  const { name, category, quantity } = req.body;
  const userId = req.user.id;

  if (!name) {
    return next(errorHandler(400, "Item name is required"));
  }

  try {
    const item = new ShoppingItem({
      userId,
      name,
      category: category || "Other",
      quantity: quantity || "",
      isChecked: false
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: "Shopping item added successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const getShoppingItems = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const items = await ShoppingItem.find({ userId }).sort({ createdAt: -1 });

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    // Within each category, sort checked items to the bottom
    for (const cat in grouped) {
      grouped[cat].sort((a, b) => {
        if (a.isChecked === b.isChecked) return 0;
        return a.isChecked ? 1 : -1;
      });
    }

    res.status(200).json({
      success: true,
      message: "Shopping items retrieved successfully",
      items: grouped,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleChecked = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const item = await ShoppingItem.findOne({ _id: itemId, userId });
    if (!item) {
      return next(errorHandler(404, "Shopping item not found"));
    }

    item.isChecked = !item.isChecked;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Shopping item checkbox toggled successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const editShoppingItem = async (req, res, next) => {
  const { itemId } = req.params;
  const { name, category, quantity, isChecked } = req.body;
  const userId = req.user.id;

  try {
    const item = await ShoppingItem.findOne({ _id: itemId, userId });
    if (!item) {
      return next(errorHandler(404, "Shopping item not found"));
    }

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = quantity;
    if (isChecked !== undefined) item.isChecked = isChecked;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Shopping item updated successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShoppingItem = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const item = await ShoppingItem.findOneAndDelete({ _id: itemId, userId });
    if (!item) {
      return next(errorHandler(404, "Shopping item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Shopping item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const clearCheckedItems = async (req, res, next) => {
  const userId = req.user.id;

  try {
    await ShoppingItem.deleteMany({ userId, isChecked: true });

    res.status(200).json({
      success: true,
      message: "Checked items cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
