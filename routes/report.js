import { Router } from "express";
import Report from "../models/Report.js";
import logger from "../constants/logger.js";
import User from "../models/User.js";
import Forum from "../models/Forums.js";

const router = Router();

router.post("/user", async (req, res) => {
  const body = req.body;

  body.setFields("userId title message");

  const reqFields = body.anyNuldefined("userId message", ",");
  if (reqFields.length !== 0) return res.failure(`Required : ${reqFields}`);

  try {
    const user = await User.findByPk(body.get("userId"));
    if (user === null) return res.failure("Bad userId, no user found");

    const report = await Report.create(body.data);

    res.ok("Reported", { report });
  } catch (err) {
    logger.error("report on user failed", err, req.user, { body: body.data });
    res.serverError();
  }
});

router.post("/forum", async (req, res) => {
  const body = req.body;

  body.setFields("forumId title message");

  const reqFields = body.anyNuldefined("forumId message", ",");
  if (reqFields.length !== 0) return res.failure(`Required : ${reqFields}`);

  try {
    const forum = await Forum.findByPk(body.get("forumId"));
    if (forum === null) return res.failure("Bad forumId, no forum found");

    const report = await Report.create(body.data);

    res.ok("Reported", { report });
  } catch (err) {
    logger.error("report on forum failed", err, req.user, { body: body.data });
    res.serverError();
  }
});

export const ReportRouter = router;
