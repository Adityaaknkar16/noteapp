import express from "express";
import { verifyToken } from "../utilies/verifyUser.js";
import {
  addSubject,
  getSubjects,
  addGradeToSubject,
  deleteSubject,
  addEvent,
  getEvents,
  deleteEvent
} from "../controller/academic.controller.js";

const router = express.Router();

// Subjects endpoints
router.post("/subjects/add", verifyToken, addSubject);
router.get("/subjects/all", verifyToken, getSubjects);
router.post("/subjects/:subjectId/add-grade", verifyToken, addGradeToSubject);
router.delete("/subjects/delete/:subjectId", verifyToken, deleteSubject);

// Schedule / Events endpoints
router.post("/events/add", verifyToken, addEvent);
router.get("/events/all", verifyToken, getEvents);
router.delete("/events/delete/:eventId", verifyToken, deleteEvent);

export default router;
