import express from "express";
import pkg from "jsonwebtoken";
const { verify } = pkg;

import { verifyToken } from "../utilies/verifyUser.js";
import { addNote } from "../controller/note.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addNote);

export default router;