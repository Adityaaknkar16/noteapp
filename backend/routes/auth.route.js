import express from "express";
import { signOut, signup } from "../controller/auth.controller.js";

import { signin } from "../controller/auth.controller.js";
import { verifyToken } from "../utilies/verifyUser.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signOut",verifyToken, signOut);



export default router;