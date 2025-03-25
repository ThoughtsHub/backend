import { Router } from "express";
import { LoginRouter } from "./login.js";
import { OtpRouter } from "./otp.js";
import { TestRouter } from "./extras_testing.js";

const router = Router();

router.use("/", LoginRouter);

router.use("/otp", OtpRouter);

router.use("/", TestRouter);

router.get("/", (_, res) => {
  console.log("hello");

  res.ok(452);
});

export const AppRouter = router;
