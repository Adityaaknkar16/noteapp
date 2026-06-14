import express from "express";
import { signOut, signup, signin, google, forgotPassword, resetPassword } from "../controller/auth.controller.js";
import { verifyToken } from "../utilies/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/signOut", verifyToken, signOut);

export default router;