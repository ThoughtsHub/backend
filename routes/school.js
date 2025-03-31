import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import { UpgradedBody } from "../middlewares/body.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const schools = [];

  // TODO: add colleges in database

  res.ok("college added");
  logger.warning("Colleges not added, but response sent successful", req.user, {
    reason: "method not fully defined",
  });
});

export const ProfileCollegeRouter = router;
