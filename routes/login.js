import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.login; // login handler

const router = Router();

// Login
router.post("/", handler.login);

// Signup
router.post("/new", handler.signup);

export const LoginRouter = router;
