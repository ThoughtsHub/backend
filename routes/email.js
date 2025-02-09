import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.email; // email handler

const router = Router();

// requires email in query
router.get("/verify", handler.send); // send otp

// requires email and otp in body
router.post("/verify", handler.verify); // verify otp

export const EmailRouter = router;
