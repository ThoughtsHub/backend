import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import StoryComment from "../models/StoryComment.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter } from "../constants/writer.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;
  body.setFields("storyId body localId");

  const reqFields = body.anyNuldefined("storyId body", ",");
  if (reqFields.length !== 0) {
    logger.warning("Comment for story could not be created", req.user, {
      reason: "Required fields were missind",
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const t = await db.transaction();
  try {
    const comment = await StoryComment.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Commented", { comment });
    await t.commit();
    logger.info("Commented on story", req.user, { body: body.data, comment });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", err, req.user, {
      event: "comment on story failed",
      body: body.data,
    });

    res.serverErro();
  }
});

router.get("/", async (req, res) => {
  const body = req.query;
  body.setFields("timestamp storyId");

  if (body.isNuldefined("storyId")) {
    logger.warning("Delivering story's comments failed", req.user, {
      reason: "No story Id given",
      body: body.data,
    });
    return res.failure("Story Id is required");
  }
  const [timestamp, storyId] = body.bulkGet("timestamp storyId");

  const whereObj = req.query.isNumber(timestamp)
    ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
    : {};

  try {
    const comments = await StoryComment.findAll({
      where: { storyId, ...whereObj },
      order: [[timestampsKeys.createdAt, "DESC"]],
      limit: 30,
      include: [includeWriter],
    });

    res.ok("Comments", { comments });
    logger.info("Story's comments delivered", req.user, {
      comments,
      body: body.data,
      whereObj,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "story's comment delivery failed",
      body: body.data,
      whereObj,
    });

    res.serverError();
  }
});

export const StoryCommentRouter = router;
