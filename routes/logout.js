import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.logout; // logout handler

const router = Router();

router.get("/", handler.logout);

export const LogoutRouter = router;
