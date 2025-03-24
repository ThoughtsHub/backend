import { Router } from "express";
import { LoginRouter } from "./login.js";
import { OtpRouter } from "./otp.js";

const router = Router();

router.use("/", LoginRouter);

router.use("/otp", OtpRouter);

router.get("/", (_, res) => {
  console.log("hello");

  res.ok(452);
});

export const AppRouter = router;
