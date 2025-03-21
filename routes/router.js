import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  console.log("hello");
});

export const AppRouter = router;
