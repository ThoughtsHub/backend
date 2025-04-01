import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import User from "../models/User.js";
import { usernameNotAvailable } from "../utils/username.js";
import Profile from "../models/Profile.js";
import logger from "../constants/logger.js";
import Story from "../models/Story.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { validate as isUUID } from "uuid";
import Forum from "../models/Forums.js";
import ForumVote from "../models/ForumVote.js";
import StoryLike from "../models/StoryLike.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const body = req.body;

  body.setFields("fullName username profileImageUrl gender dob about");

  const requiredFields = body.anyNuldefined("fullName username about", ",");
  if (requiredFields.length !== 0) {
    logger.warning("Profile creation failed", req.user, {
      reason: "required fields not given",
      requires: requiredFields,
      body: body.data,
    });
    return res.failure(`Required : ${requiredFields}`);
  }

  const transaction = await db.transaction();

  try {
    const username = body.get("username");
    if (await usernameNotAvailable(username)) {
      logger.warning("Profile creation failed", req.user, {
        reason: "username unavailablity",
        username,
        body: body.data,
      });
      return res.failure("Username not avalilable");
    }
    const [userUpdate] = await User.update(
      { username },
      { where: { id: req.userId }, transaction }
    );

    if (userUpdate !== 1) {
      await transaction.rollback();
      logger.warning("Profile creation failed", req.user, {
        reason: "user update was not just in one field, or maybe in any field",
        username,
        updatedInRows: userUpdate,
        body: body.data,
      });
      return res.failure("username could not be set, contact admin");
    }

    body.set("userId", req.userId);
    const profile = await Profile.create(body.data, { transaction });

    res.ok("Profile created", { user: profile });
    await transaction.commit();
    logger.info("Profile created", req.user, {
      body: body.data,
      profile,
      username,
      userUpdate,
    });
  } catch (err) {
    await transaction.rollback();

    logger.error("Internal server error", err, req.user, { body: body.data });

    res.serverError();
  }
});

router.get("/", loggedIn, async (req, res) => {
  if (req.query.isNuldefined("profileId"))
    return res.failure("Profile Id is required");
  const profileId = req.query.get("profileId");

  try {
    const profile = await Profile.findByPk(profileId);
    const user = await User.findByPk(profile.userId);
    res.ok("Profile found", {
      profile: { ...profile.get({ plain: true }), username: user.username },
    });
    logger.info("Profile was delivered", req.user, {
      profile,
      body: req.query.data,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, { body: body.data });

    res.serverError();
  }
});

router.get("/me", loggedIn, async (req, res) => {
  try {
    const profile = await Profile.findByPk(req.user.Profile.id);
    const user = await User.findByPk(profile.userId);
    res.ok("Your Profile", {
      profile: { ...profile.get({ plain: true }), username: user.username },
    });
    logger.info("User's Profile was delivered", req.user, { profile });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      happened: "user's own profile couldn't be delivered",
    });

    res.serverError();
  }
});

router.get("/story", loggedIn, async (req, res) => {
  const userProfileId = req.user.Profile.id;
  const offset = req.query.isNumber(req.query.get("offset"))
    ? req.query.get("offset")
    : 0;

  const profileId = isUUID(req.query.get("profileId"))
    ? req.query.get("profileId")
    : userProfileId;

  try {
    let stories = await Story.findAll({
      where: { profileId },
      offset,
      limit: 40,
      order: [[timestampsKeys.createdAt, "desc"]],
      include: [{ model: StoryLike, required: false, where: { profileId } }],
    });

    stories = stories.map((f) => {
      f = f.get({ plain: true });
      if (Array.isArray(f.StoryLikes) && f.StoryLikes.length === 1)
        f.likedByUser = true;
      f.likedByUser = true;
      delete f.StoryLikes;
      return f;
    });

    res.ok("Stories", {
      stories,
      nextOffset: stories.length + offset,
      endOfUserStories: stories.length < 40,
    });
    logger.info("Stories delivered", req.user, {
      query: req.query.data,
      stories,
    });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Internal server error", err, req.user, {
      event: "stories requested by user could not be delivered /profile/story",
      query: req.query.data,
    });
  }
});

router.get("/forums", loggedIn, async (req, res) => {
  const userProfileId = req.user.Profile.id;
  const offset = req.query.isNumber(req.query.get("offset"))
    ? req.query.get("offset")
    : 0;

  const profileId = isUUID(req.query.get("profileId"))
    ? req.query.get("profileId")
    : userProfileId;

  try {
    let forums = await Forum.findAll({
      where: { profileId },
      offset,
      limit: 40,
      order: [[timestampsKeys.createdAt, "desc"]],
      include: [{ model: ForumVote, required: false, where: { profileId } }],
    });

    forums = forums.map((f) => {
      f = f.get({ plain: true });
      if (Array.isArray(f.ForumVotes) && f.ForumVotes.length === 1)
        f.isVoted = true;
      f.isVoted = true;
      delete f.ForumVotes;
      return f;
    });

    res.ok("Forums", {
      forums,
      nextOffset: forums.length + offset,
      endOfUserForums: forums.length < 40,
    });
    logger.info("Forums delivered", req.user, {
      query: req.query.data,
      forums,
    });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Internal server error", err, req.user, {
      event: "forums requested by user could not be delivered /profile/forums",
      query: req.query.data,
    });
  }
});

export const ProfileRouter = router;
