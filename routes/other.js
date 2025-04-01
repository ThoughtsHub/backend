import { Router } from "express";
import { usernameAvailable } from "../utils/username.js";
import logger from "../constants/logger.js";
import { loggedAsAdmin } from "../middlewares/auth/auth.js";
import User from "../models/User.js";

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

router.post("/check-admin", loggedAsAdmin, async (req, res) => {
  const body = req.body;

  if (body.allNuldefined("username password")) {
    logger.warning("admin login attempt failed", null, {
      reason: "required fields missing",
      requires: "username, password",
      body: body.data,
    });
    return res.failure("Username and password are required");
  }

  const [username, password] = body.bulkGet(`username password`);

  try {
    const user = await User.findOne({ where: { username } });
    if (user === null) {
      logger.warning("admin login attempt failed", null, {
        reason: "credentials invalid: username",
        body: body.data,
        userFound: user,
      });
      return res.failure(`Bad username`);
    }
    if (user.password !== password) {
      logger.warning("admin login attempt failed", null, {
        reason: "wrong password",
        body: body.data,
        userFound: user,
      });
      return res.unauth("Wrong password");
    }

    const userToken = await setupAuth(user.id);
    res.ok("Admin Log in successful", { auth_token: userToken });
    logger.info("login successfull", req.user, {
      userToken,
      body: body.data,
      user,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "admin login attempt failed",
      body: body.data,
    });

    res.serverError();
  }
});

export const OtherRouter = router;
