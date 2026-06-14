import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addPantryItem,
  getPantryItems,
  editPantryItem,
  deletePantryItem,
  getLowStockItems,
} from "../controller/pantryItem.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addPantryItem);
router.get("/all", verifyToken, getPantryItems);
router.post("/edit/:itemId", verifyToken, editPantryItem);
router.delete("/delete/:itemId", verifyToken, deletePantryItem);
router.get("/low-stock", verifyToken, getLowStockItems);

export default router;
