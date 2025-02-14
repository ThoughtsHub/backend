import { Router } from "express";
import { client } from "../db/clients.js";
import { SID } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await client.del(req.sessionId); // remove from db
    res.clearCookie(SID); // remove cookies

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const LogoutRouter = router;
