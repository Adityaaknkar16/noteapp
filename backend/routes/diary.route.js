import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import { addDiaryEntry, getDiaryEntries, editDiaryEntry, deleteDiaryEntry, getStats } from "../controller/diary.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addDiaryEntry);
router.get("/all", verifyToken, getDiaryEntries);
router.post("/edit/:entryId", verifyToken, editDiaryEntry);
router.delete("/delete/:entryId", verifyToken, deleteDiaryEntry);
router.get("/stats", verifyToken, getStats);

export default router;
