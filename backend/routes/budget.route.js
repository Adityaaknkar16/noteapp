import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addTransaction,
  getTransactions,
  editTransaction,
  deleteTransaction,
  getSummary
} from "../controller/budget.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addTransaction);
router.get("/all", verifyToken, getTransactions);
router.get("/summary", verifyToken, getSummary);
router.put("/edit/:transactionId", verifyToken, editTransaction);
router.delete("/delete/:transactionId", verifyToken, deleteTransaction);

export default router;
