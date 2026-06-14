import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addDrawing,
  getAllDrawings,
  getDrawingById,
  editDrawing,
  deleteDrawing
} from "../controller/drawing.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addDrawing);
router.get("/all", verifyToken, getAllDrawings);
router.get("/:drawingId", verifyToken, getDrawingById);
router.post("/edit/:drawingId", verifyToken, editDrawing);
router.delete("/delete/:drawingId", verifyToken, deleteDrawing);

export default router;
