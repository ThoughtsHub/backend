import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import { UpgradedBody } from "../middlewares/body.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const schools = [];

  // TODO: add colleges in database

  res.ok("college added");
});

export const ProfileCollegeRouter = router;
