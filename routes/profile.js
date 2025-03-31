import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import User from "../models/User.js";
import { usernameNotAvailable } from "../utils/username.js";
import Profile from "../models/Profile.js";
import logger from "../constants/logger.js";

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
    logger.info("User's Profile was delivered", req.user, {profile});
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      happened: "user's own profile couldn't be delivered",
    });

    res.serverError();
  }
});

export const ProfileRouter = router;
