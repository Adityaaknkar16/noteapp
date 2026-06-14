import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addHabit,
  getHabits,
  editHabit,
  deleteHabit,
  toggleHabitDate
} from "../controller/habit.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addHabit);
router.get("/all", verifyToken, getHabits);
router.post("/edit/:habitId", verifyToken, editHabit);
router.delete("/delete/:habitId", verifyToken, deleteHabit);
router.post("/toggle/:habitId", verifyToken, toggleHabitDate);

export default router;
