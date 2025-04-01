import { Router } from "express";
import { timestampsKeys } from "../constants/timestamps.js";
import { Op } from "sequelize";
import Forum from "../models/Forums.js";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import ForumVote from "../models/ForumVote.js";
import { ForumCommentRouter } from "./forums_comments.js";
import { includeWriter } from "../constants/writer.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  body.setFields("title body localId imageUrl");

  const reqFields = body.anyNuldefined("title body", ",");
  if (reqFields.length !== 0) {
    logger.warning("forum creation failed", req.user, {
      reason: "required fields missing",
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const t = await db.transaction();
  try {
    const newForum = await Forum.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Forum Created", { forum: newForum });
    await t.commit();
    logger.info("forum created", req.user, {
      body: body.data,
      createdForum: newForum,
    });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", req.user, {
      event: "forum creation failed",
      body: body.data,
    });

    res.serverError();
  }
});

router.get("/", async (req, res) => {
  const timestamp = req.query.get("timestamp");

  const whereObj = req.query.isNumber(timestamp)
    ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
    : {};

  try {
    const includeObj =
      req.loggedIn === true
        ? [
            {
              model: ForumVote,
              required: false,
              where: { profileId: req.user.Profile.id },
            },
          ]
        : [];

    let forums = await Forum.findAll({
      where: { ...whereObj },
      limit: 50,
      order: [[timestampsKeys.createdAt, "DESC"]],
      include: [includeWriter, ...includeObj],
    });

    forums = forums.map((f) => {
      f = f.get({ plain: true });
      if (Array.isArray(f.ForumVotes) && f.ForumVotes.length === 1)
        f.isVoted = true;
      else f.isVoted = false;
      delete f.ForumVotes;
      return f;
    });

    res.ok("Forums", { forums });
    logger.info("forums delivered", req.user, {
      forums,
      timestamp,
      body: req.query.data,
      whereObj,
      includeObj,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "forum creation failed",
      body: body.data,
      whereObj,
    });

    res.serverError();
  }
});

router.post("/upvote", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;
  body.setFields("forumId value");

  if (body.isNuldefined("forumId")) {
    logger.warning("upvoting for forum failed", req.user, {
      reason: "forum Id not given",
      body: body.data,
    });
    return res.failure("Forum Id is required");
  }
  body.set("value", body.isTrue("value") ? 1 : 0);

  const [forumId, value] = body.bulkGet("forumId value");

  const t = await db.transaction();
  try {
    const forumVote = await ForumVote.findOne({
      where: { forumId, profileId },
    });

    let vote;
    if (forumVote !== null)
      vote = await ForumVote.update(
        { value: body.get("value") },
        { where: { forumId, profileId } }
      );
    else
      vote = await ForumVote.create(
        { ...body.data, profileId },
        { transaction: t }
      );

    res.ok("Voted");
    await t.commit();
    logger.info("voted on forum", req.user, {
      body: body.data,
      createdVote: vote,
      forumVote,
    });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", err, req.user, {
      event: "voting on forum failed",
      body: body.data,
    });

    res.serverError();
  }
});

router.use("/comments", ForumCommentRouter);

export const ForumsRouter = router;
