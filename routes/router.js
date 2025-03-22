import { Router } from "express";
import { LoginRouter } from "./login.js";

const router = Router();

router.use("/", LoginRouter);

router.get("/", (_, res) => {
  console.log("hello");

  res.ok(452);
});

export const AppRouter = router;
