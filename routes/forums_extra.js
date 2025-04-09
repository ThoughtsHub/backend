import { Router } from "express";
import Forum from "../models/Forums.js";
import logger from "../constants/logger.js";
import { timestampsKeys } from "../constants/timestamps.js";
import ForumVote from "../models/ForumVote.js";
import { includeWriter } from "../constants/writer.js";

const forumsLimitPerPage = 30;

const router = Router();

// by offset
router.get("/bo", async (req, res) => {
  const body = req.query;

  const offset = body.toNumber("offset");

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
      where: {},
      offset: offset * forumsLimitPerPage,
      limit: forumsLimitPerPage,
      order: [[timestampsKeys.updatedAt, "DESC"]],
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

    res.ok("Forums", { forums, newOffset: offset + forums.length });
    logger.info("Forums delivered", req.user, { body: body.data, forums });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "Forums deliver failed",
      body: body.data,
    });

    res.serverError();
  }
});

// get count of total news pages
router.get("/pages", async (req, res) => {
  const body = req.query;

  try {
    const forumCount = await Forum.count({
      where: {},
    });

    const pages = Math.ceil(forumCount / forumsLimitPerPage);

    res.ok("Forums Count", { total: pages });
    logger.info("Forums count delivered", req.user, {
      body: body.data,
      total: pages,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "Forums count deliver failed",
      body: body.data,
    });

    res.serverError();
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const forum = await Forum.findByPk(id);

    res.ok("Forum", { forum });
    logger.info("Forum delivered", req.user, { forum, id });
  } catch (err) {
    logger.error("Forum couldn't be delivered", err, req.user, { id });
  }
});

export const ForumsExtra = router;
