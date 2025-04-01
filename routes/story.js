import { Router } from "express";
import Story from "../models/Story.js";
import StoryLike from "../models/StoryLike.js";
import { StoryCommentRouter } from "./story_comments.js";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import { timestampsKeys } from "../constants/timestamps.js";
import db from "../db/pg.js";
import { includeWriter } from "../constants/writer.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  body.setFields("content categorization decoration");

  try {
    body.data = {
      ...body.get("content"),
      ...body.get("categorization"),
      ...body.get("decoration"),
    };
  } catch (err) {
    logger.error("Error due to bad formatting of ", err, req.user, {
      body: body.data,
    });

    return res.failure("bad format");
  }

  body.setFields(
    "localId title body caption category genre color backgroundColor backgroundImageId alignment"
  );

  const reqFields = body.anyNuldefined("title body category", ",");
  if (reqFields.length !== 0) {
    logger.warning("Required variables were not given", req.user, {
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const t = await db.transaction();
  try {
    const newStory = await Story.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Story Created", { story: newStory });
    await t.commit();
    logger.info("Story created", req.user, {
      story: newStory,
      body: body.data,
      user: req.user,
    });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", err, req.user, { body: body.data });

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
              model: StoryLike,
              required: false,
              where: { profileId: req.user.Profile.id },
            },
          ]
        : [];

    let stories = await Story.findAll({
      where: { ...whereObj },
      limit: 50,
      order: [[timestampsKeys.createdAt, "DESC"]],
      include: [includeWriter, ...includeObj],
    });

    stories = stories.map((f) => {
      f = f.get({ plain: true });
      if (Array.isArray(f.StoryLikes) && f.StoryLikes.length === 1)
        f.likedByUser = true;
      else f.likedByUser = false;
      delete f.StoryLikes;
      return f;
    });

    res.ok("Stories", { stories });
    logger.info("Stories delivered", req.user, {
      stories,
      timestamp,
      whereObj,
      includeObj,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      body: req.query.data,
    });

    res.serverError();
  }
});

router.post("/like", loggedIn, haveProfile, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  if (body.isNuldefined("storyId")) {
    logger.warning("Story couldn't be liked", req.user, {
      reason: "No Story Id given",
      body: body.data,
    });
    return res.failure("Story Id is required");
  }
  const value = body.isTrue("value") ? 1 : 0;
  const storyId = body.get("storyId");

  const t = await db.transaction();
  try {
    const storylike = await StoryLike.findOne({
      where: { storyId, profileId },
    });

    let like;
    if (storylike !== null) {
      if (value === 0)
        await StoryLike.destroy({ where: { storyId, profileId } });
    } else {
      if (value === 1) like = await StoryLike.create({ storyId, profileId });
    }

    res.ok("Liked");
    await t.commit();
    logger.info("Story was liked", req.user, { like, body: body.data });
  } catch (err) {
    await t.rollback();
    logger.error("Internal server error", err, req.user, { body: body.data });

    res.serverError();
  }
});

router.use("/comments", StoryCommentRouter);

export const StoryRouter = router;
