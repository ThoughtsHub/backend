import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import User from "../models/User.js";
import { usernameNotAvailable } from "../utils/username.js";
import Profile from "../models/Profile.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const body = req.body;

  body.setFields("fullName username profileImageUrl gender dob about");

  const requiredFields = body.anyNuldefined("fullName username about", ",");
  if (requiredFields.length !== 0)
    return res.failure(`Required : ${requiredFields}`);

  const transaction = await db.transaction();

  try {
    const username = body.get("username");
    if (await usernameNotAvailable(username))
      return res.failure("Username not avalilable");
    const [userUpdate] = await User.update(
      { username },
      { where: { id: req.userId }, transaction }
    );

    if (userUpdate !== 1) {
      await transaction.rollback();
      return res.failure("username could not be set, contact admin");
    }

    body.bulkSet("followers following storyCount forumsCount", 0);

    body.set("userId", req.userId);
    const profile = await Profile.create(body.data, { transaction });
    res.ok("Profile created", { profile });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.log(err);
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
  } catch (err) {
    console.log(err);

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
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const ProfileRouter = router;
