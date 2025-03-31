import { Router } from "express";
import { usernameAvailable } from "../utils/username.js";
import logger from "../constants/logger.js";

const router = Router();

router.get("/check-username", async (req, res) => {
  if (req.query.isNuldefined("username")) {
    logger.warning("username not available", req.user, {
      body: req.query.data,
    });
    return res.failure("username required");
  }
  const username = req.query.get("username");

  try {
    if (await usernameAvailable(username)) {
      logger.info("username available", req.user, {
        username,
        body: req.query.data,
      });
      res.ok("Username available", { isAvailable: true });
    } else {
      logger.warning("username not available", req.user, {
        username,
        body: req.query.data,
      });
      res.failure("Username not available", 404, { isAvailable: false });
    }
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "username availability check",
    });

    res.serverError();
  }
});

export const OtherRouter = router;
