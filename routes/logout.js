import { Router } from "express";
import handler from "../controllers/logout.js";

const router = Router();

router.get("/", handler.logout);

export const LogoutRouter = router;
