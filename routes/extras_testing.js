import { Router } from "express";
import auth from "../middlewares/auth.js";
import { spawn } from "child_process";
import env from "../constants/env.js";
import _req from "../utils/request.js";
import User from "../models/user.js";

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
router.get("/test", auth.login, (req, res) => {
  res.json({ user: req.user });
});

/**
 * ONLY FOR DEVELOPING PHASE
 * Reloads the website by pulling the latest commit
 */
router.get("/reload-website", async (_, res) => {
  const child = spawn(reloadProgram, reloadOptions, {
    env: { ...env.app },
    detached: true,
    stdio: "ignore",
    shell: isWindows, // necessary in windows to run a detached process
  });

  // detach process
  child.unref();

  res.send("Restarting....");
  process.exit(0);
});

/**
 * ONLY FOR DEVELOPMENT PHASE
 * deletes a user that has been created
 * requires email or mobile in the query
 * if both given, email will be given preference, then mobile
 */
router.get("/delete-user", async (req, res) => {
  const { email = null, mobile = null } = req.query;

  if (_req.allNull(email, mobile)) return res.noParams();

  try {
    let user = null;
    if (user === null) user = await User.findOne({ where: { email } });
    if (user === null) user = await User.findOne({ where: { mobile } });

    if (user === null) return res.bad("No user like that to delete");

    const destroyResult = await User.destroy({ where: { id: user.id } });
    if (destroyResult === 1) return res.ok("Deletion Successfull");

    res.serverError();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const TestRouter = router;
