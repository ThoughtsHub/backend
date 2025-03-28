import { Router } from "express";
import { usernameAvailable } from "../utils/username.js";
import logger from "../constants/logger.js";

const router = Router();

router.get("/check-username", async (req, res) => {
  if (req.query.isNuldefined("username"))
    return res.failure("username required");
  const username = req.query.get("username");

  try {
    if (await usernameAvailable(username))
      res.ok("Username available", { isAvailable: true });
    else res.failure("Username not available", 404, { isAvailable: false });
  } catch (err) {
    logger.error(err);

    res.serverError();
  }
});

export const OtherRouter = router;
