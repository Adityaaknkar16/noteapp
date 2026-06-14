import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import { 
  addNote, 
  deleteNote, 
  editNote, 
  getAllNotes, 
  updatenotepinned, 
  searchNotes, 
  inviteCollaborator,
  setNotePin,
  removeNotePin,
  verifyNotePin,
  generateShareLink,
  revokeShareLink,
  getSharedNote
} from "../controller/note.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addNote);
router.post("/edit/:noteId", verifyToken, editNote)
router.get("/all", verifyToken, getAllNotes)
router.delete("/delete/:noteId", verifyToken, deleteNote)
router.put("/update-note-pinned/:noteId", verifyToken, updatenotepinned)
router.get("/search", verifyToken, searchNotes)
router.post("/invite/:noteId", verifyToken, inviteCollaborator)

// PIN Lock routes
router.post("/lock/:noteId", verifyToken, setNotePin)
router.post("/unlock/:noteId", verifyToken, removeNotePin)
router.post("/verify-pin/:noteId", verifyToken, verifyNotePin)

// Sharing routes
router.post("/share/generate/:noteId", verifyToken, generateShareLink)
router.post("/share/revoke/:noteId", verifyToken, revokeShareLink)
router.get("/shared/:token", getSharedNote) // Unauthenticated read-only note view

export default router;

