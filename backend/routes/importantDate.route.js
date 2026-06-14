import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addImportantDate,
  getImportantDates,
  editImportantDate,
  deleteImportantDate,
  getUpcomingDates,
} from "../controller/importantDate.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addImportantDate);
router.get("/all", verifyToken, getImportantDates);
router.post("/edit/:dateId", verifyToken, editImportantDate);
router.delete("/delete/:dateId", verifyToken, deleteImportantDate);
router.get("/upcoming", verifyToken, getUpcomingDates);

export default router;
