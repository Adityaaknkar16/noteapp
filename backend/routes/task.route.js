import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import { addTask, getTasks, editTask, deleteTask } from "../controller/task.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addTask);
router.get("/all", verifyToken, getTasks);
router.post("/edit/:taskId", verifyToken, editTask);
router.delete("/delete/:taskId", verifyToken, deleteTask);

export default router;
