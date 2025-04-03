import { Router } from "express";
import { spawn } from "child_process";
import User from "../models/User.js";
import { loggedAsAdmin, loggedIn } from "../middlewares/auth/auth.js";
import env from "../env/env.config.js";
import logger from "../constants/logger.js";

const isWindows = process.platform === "win32";

// Path to reload shell script
const scriptPath = `./scripts/reload.${isWindows ? "ps1" : "sh"}`;
const reloadProgram = isWindows ? "powershell.exe" : "bash";
const reloadOptions = isWindows ? ["-File", scriptPath] : [scriptPath];

const router = Router();

/**
 * ONLY FOR DEVELOPING PHASE
 * Sends the user object referenced to the sessionID
 */
router.get("/test", loggedIn, (req, res) => {
  res.json({ user: req.user });
  logger.info("test success", req.user, { user: req.user });
});

/**
 * ONLY FOR DEVELOPING PHASE
 * Reloads the website by pulling the latest commit
 */
router.get("/reload-website", async (req, res) => {
  const child = spawn(reloadProgram, reloadOptions, {
    env: { ...env.server },
    detached: true,
    stdio: "ignore",
    shell: isWindows, // necessary in windows to run a detached process
  });

  // detach process
  child.unref();

  res.send("Restarting....");
  logger.info("Website restarting", req.user, {
    envServer: env.server,
    options: {
      env: { ...env.server },
      detached: true,
      stdio: "ignore",
      shell: isWindows,
    },
    reloadOptions,
    reloadProgram,
  });
  process.exit(0);
});

/**
 * ONLY FOR DEVELOPMENT PHASE
 * deletes a user that has been created
 * requires email or mobile in the query
 * if both given, email will be given preference, then mobile
 */
router.get("/delete-user-admin", async (req, res) => {
  const body = req.query;

  if (body.allNuldefined("email mobile")) {
    logger.warning("delete user failed", req.user, {
      reason: "required fields not given",
      requires: "email, mobile",
      body: body.data,
    });
    return res.failure("Email or mobile required");
  }

  const [email, mobile] = body.bulkGet("email mobile");
  try {
    let user = null;
    if (user === null) user = await User.findOne({ where: { email } });
    if (user === null) user = await User.findOne({ where: { mobile } });

    if (user === null) {
      logger.warning("delete user failed", req.user, {
        reason: "user not found with given credentials",
        body: body.data,
        userFound: user,
      });
      return res.failure("No user like that to delete");
    }

    const destroyResult = await User.destroy({ where: { id: user.id } });
    if (destroyResult === 1) {
      logger.info("user deleted", req.user, {
        userFound: user,
        destroyResult,
        body: body.data,
      });
      return res.ok("Deletion Successfull");
    }

    res.serverError();
    logger.warning("delete user failed", req.user, {
      reason: "destroy Result was not 1",
      body: body.data,
      userFound: user,
      destroyResult,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, { body: body.data });

    res.serverError();
  }
});

export const TestRouter = router;
