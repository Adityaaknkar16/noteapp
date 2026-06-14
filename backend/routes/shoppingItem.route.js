import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addShoppingItem,
  getShoppingItems,
  toggleChecked,
  editShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
} from "../controller/shoppingItem.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addShoppingItem);
router.get("/all", verifyToken, getShoppingItems);
router.post("/toggle/:itemId", verifyToken, toggleChecked);
router.post("/edit/:itemId", verifyToken, editShoppingItem);
router.delete("/delete/:itemId", verifyToken, deleteShoppingItem);
router.delete("/clear-checked", verifyToken, clearCheckedItems);

export default router;
