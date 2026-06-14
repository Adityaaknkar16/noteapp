import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addBill,
  getBills,
  editBill,
  deleteBill,
  getUpcomingBills,
  markBillAsPaid,
} from "../controller/bill.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addBill);
router.get("/all", verifyToken, getBills);
router.post("/edit/:billId", verifyToken, editBill);
router.delete("/delete/:billId", verifyToken, deleteBill);
router.get("/upcoming", verifyToken, getUpcomingBills);
router.post("/pay/:billId", verifyToken, markBillAsPaid);

export default router;
