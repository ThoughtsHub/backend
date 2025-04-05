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

router.put("/", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  body.setFields("title body localId imageUrl forumId");

  const reqFields = body.anyNuldefined("title body forumId", ",");
  if (reqFields.length !== 0) {
    logger.warning("forum update failed", req.user, {
      reason: "required fields missing",
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const forumId = body.get("forumId");
  body.del("forumId");

  const t = await db.transaction();
  try {
    const [updateResult] = await Forum.update(
      { ...body.data },
      { where: { id: forumId, profileId }, transaction: t }
    );

    if (updateResult !== 1) {
      await t.rollback();
      logger.warning("Forum update failed", req.user, {
        body: body.data,
        forumId,
        profileId,
      });
      return res.failure("Forum does not belong to you.");
    }

    const newForum = await Forum.findByPk(forumId);

    res.ok("Forum Updated", { forum: newForum.get({ plain: true }) });
    await t.commit();
    logger.info("forum updated", req.user, {
      body: body.data,
      createdForum: newForum,
    });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", req.user, {
      event: "forum update failed",
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
              where: { profileId: req.user.Profile.id, value: 1 },
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

router.delete("/", async (req, res) => {
  if (req.query.isNuldefined("forumId")) {
    logger.warning("Forum deletion failed", req.user, { query: req.query });
    return res.failure("ForumId is required");
  }

  const forumId = req.query.get("forumId");
  const profileId = req.user.Profile.id;

  const t = await db.transaction();
  try {
    const destroyResult = await Forum.destroy({
      where: { id: forumId, profileId },
    });

    if (destroyResult !== 1) {
      await t.rollback();
      logger.warning("Forum deletion failed", req.user, {
        query: req.query,
        destroyResult,
      });
      return res.failure(
        "No forum found that belongs to you with that forum Id"
      );
    }

    res.ok("Forum deleted");
    await t.commit();
    logger.info("Forum deleted", req.user, {
      query: req.query,
      destroyResult,
    });
  } catch (err) {
    await t.rollback();
    console.log(err);

    logger.error("Internal server error", err, req.user, {
      query: req.query,
      event: "Forum deletion failed",
    });
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
