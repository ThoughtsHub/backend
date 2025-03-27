import { Router } from "express";
import Story from "../models/Story.js";
import StoryLike from "../models/StoryLike.js";
import { StoryCommentRouter } from "./story_comments.js";
import { loggedIn } from "../middlewares/auth/auth.js";
import { timestampsKeys } from "../constants/timestamps.js";
import db from "../db/pg.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
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
    console.log(err);
    return res.failure("bad format");
  }

  body.setFields(
    "localId title body caption category genre color backgroundColor backgroundImageId alignment"
  );

  const reqFields = body.anyNuldefined("title body category", ",");
  if (reqFields.length !== 0) return res.failure(`Required: ${reqFields}`);

  const t = await db.transaction();
  try {
    const newStory = await Story.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Story Created", { story: newStory });
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.serverError();
  }
});

router.get("/", async (req, res) => {
  const timestamp = req.query.get("timestamp");

  const whereObj = req.query.isNumber(timestamp)
    ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
    : {};

  try {
    const stories = await Story.findAll({
      where: { ...whereObj },
      limit: 50,
      order: [[timestampsKeys.createdAt, "DESC"]],
    });

    res.ok("Stories", { stories });
  } catch (err) {
    console.log(err);
    res.serverError();
  }
});

router.post("/like", loggedIn, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  if (body.isNuldefined("storyId")) return res.failure("Story Id is required");
  const storyId = body.get("storyId");

  const t = await db.transaction();
  try {
    const like = await StoryLike.create(
      { storyId, profileId },
      { transaction: t }
    );

    res.ok("Liked");
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.serverError();
  }
});

router.use("/comments", StoryCommentRouter);

export const StoryRouter = router;
