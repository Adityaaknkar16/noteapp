import express from "express";
import pkg from "jsonwebtoken";
const { verify } = pkg;

import { verifyToken } from "../utilies/verifyUser.js";
import { addNote, deleteNote, editNote, getAllNotes, updatenotepinned, searchNotes } from "../controller/note.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addNote);

router.post("/edit/:noteId", verifyToken,editNote)
router.get("/all", verifyToken,getAllNotes)
router.delete("/delete/:noteId", verifyToken,deleteNote)

router.put("/update-note-pinned/:noteId", verifyToken, updatenotepinned)
router.get("/search", verifyToken, searchNotes)

export default router;

