import { Router } from "express";
import auth from "../middlewares/auth.js";
import { spawn } from "child_process";
import env from "../constants/env.js";

const isWindows = process.platform === "win32";

// Path to reload shell script
const scriptPath = `./scripts/reload.${isWindows ? "ps1" : "sh"}`;
const reloadProgram = isWindows ? "powershell.exe" : "bash";
const reloadOptions = isWindows ? ["-File", scriptPath] : [scriptPath];

const router = Router();

router.get("/test", auth.login, (req, res) => {
  res.json({ user: req.user });
});

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

export const TestRouter = router;
