import express from "express";
import { signOut, signup, signin, google, forgotPassword, resetPassword } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/signOut", signOut);
router.post("/signOut", signOut);
router.delete("/signOut", signOut);

export default router;