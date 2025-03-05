import { Router } from "express";
import User from "../models/user.js";

const router = Router();

router.get("/check_username", async (req, res) => {
  const username = req.query.get("username");

  try {
    const user = await User.findOne({ where: { username } });

    res.ok("Username status", { isAvailable: user === null });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const RootRouter = router;
