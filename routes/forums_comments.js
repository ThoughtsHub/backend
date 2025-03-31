import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import ForumComment from "../models/ForumComment.js";
import db from "../db/pg.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter } from "../constants/writer.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;
  body.setFields("forumId body localId");

  const reqFields = body.anyNuldefined("forumId body", ",");
  if (reqFields.length !== 0) {
    logger.warning("Comment for forum could not be created", req.user, {
      reason: "Required fields were missind",
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const t = await db.transaction();
  try {
    const comment = await ForumComment.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Commented", { comment });
    await t.commit();
    logger.info("Commented on forum", req.user, { body: body.data, comment });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", err, req.user, {
      event: "comment on forum failed",
      body: body.data,
    });

    res.serverErro();
  }
});

router.get("/", async (req, res) => {
  const body = req.query;
  body.setFields("timestamp forumId");

  if (body.isNuldefined("forumId")) {
    logger.warning("Delivering forum's comments failed", req.user, {
      reason: "No forum Id given",
      body: body.data,
    });
    return res.failure("Forum Id is required");
  }
  const [timestamp, forumId] = body.bulkGet("timestamp forumId");

  const whereObj = req.query.isNumber(timestamp)
    ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
    : {};

  try {
    const comments = await ForumComment.findAll({
      where: { forumId, ...whereObj },
      order: [[timestampsKeys.createdAt, "DESC"]],
      include: [includeWriter],
      limit: 30,
    });

    res.ok("Comments", { comments });
    logger.info("Forums's comments delivered", req.user, {
      comments,
      body: body.data,
      whereObj,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "forum's comment delivery failed",
      body: body.data,
      whereObj,
    });

    res.serverError();
  }
});

export const ForumCommentRouter = router;
