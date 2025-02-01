import { Router } from "express";
import { client } from "../db/connect.js";
import c from "../utils/status_codes.js";
import cookie from "../constants/cookies.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await client.del(req.sessionId); // remove from db
    res.clearCookie(cookie.sessionId); // remove cookies

    res.sendStatus(c.NO_CONTENT);
  } catch (err) {
    console.log(err);
    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

export const LogoutRouter = router;
