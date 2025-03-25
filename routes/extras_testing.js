import { Router } from "express";
import { spawn } from "child_process";
import { loggedIn } from "../middlewares/auth/auth.js";
import env from "../env/env.config.js";

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
});

/**
 * ONLY FOR DEVELOPING PHASE
 * Reloads the website by pulling the latest commit
 */
router.get("/reload-website", async (_, res) => {
  const child = spawn(reloadProgram, reloadOptions, {
    env: { ...env.server },
    detached: true,
    stdio: "ignore",
    shell: isWindows, // necessary in windows to run a detached process
  });

  // detach process
  child.unref();

  res.send("Restarting....");
  process.exit(0);
});

export const TestRouter = router;
