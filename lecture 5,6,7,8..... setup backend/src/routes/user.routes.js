import { Router } from "express";

const router = Router()

import { registerUser } from "../controller/user.controller.js";
router.post("/register", registerUser)


export default router