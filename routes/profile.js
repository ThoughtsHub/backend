import { Router } from "express";
import _req from "../utils/request.js";
import auth from "../middlewares/auth.js";
import checks from "../utils/checks.js";
import { db } from "../db/clients.js";
import Profile from "../models/Profile.js";
import user from "../utils/user.js";

const router = Router();

const PROFILE_FIELDS = ["fullName", "about", "gender", "dob"];

const isProfile = async (req, res, next) => {
  const isProfile = req.user.isProfile;
  if (!isProfile) return res.bad("No profile for this user exist");
  next();
};

router.get("/me", auth.login, isProfile, async (req, res) => {
  const profileId = req.user.profile?.id;

  let profile = await Profile.findByPk(profileId, {
    attributes: { exclude: ["userId", "id"] },
  });

  profile = {
    ...profile.get({ plain: true }),
    username: req.user.username,
    isUsernameSet: req.user.usernameSet,
  };

  res.ok("Your Profile", { profile });
});

router.post("/", auth.login, async (req, res) => {
  const userId = req.user.id;
  const isProfile = req.user.isProfile;
  const profileId = req.user.profile?.id;

  const {
    fullName,
    about,
    gender,
    dob: rawDob,
    username,
  } = _req.getDataO(req.body, PROFILE_FIELDS);

  if (checks.isNull(fullName) && !isProfile)
    return res.bad("Full Name is neccessary for creating profile");

  const t = await db.transaction();
  try {
    let dob;
    if (rawDob !== null) dob = Date(rawDob);
    const fields = { fullName, about, gender, dob };

    if (!checks.isNull(username)) {
      // TODO: check if username exists

      await user.updateUsername(userId, username, t);
    }

    if (isProfile)
      await Profile.update(fields, {
        where: { id: profileId },
        transaction: t,
        individualHooks: true,
      });
    else await Profile.create({ ...fields, userId }, { transaction: t });

    await t.commit();
    res.ok(`Profile ${isProfile ? "upda" : "crea"}ted`, {});
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
});

router.patch("/", auth.login, isProfile, async (req, res) => {
  const userId = req.user.id;
  const profileId = req.user.profile?.id;

  const data = _req.getDataO(req.body, PROFILE_FIELDS);

  for (const field of PROFILE_FIELDS)
    if (data[field] === null) delete data[field];

  if (checks.isNull(data.fullName))
    return res.bad("Full name cannot be set to nothing");

  const t = await db.transaction();

  try {
    if (!checks.isNull(data.username)) {
      // TODO: check if username exists

      await user.updateUsername(userId, username, t);
    }

    await Profile.update(data, {
      where: { id: profileId },
      transaction: t,
      individualHooks: true,
    });

    await t.commit();
    res.ok("Profile Updated");
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
});

router.put("/", auth.login, isProfile, async (req, res) => {
  const userId = req.user.id;
  const profileId = req.user.profile?.id;

  const data = _req.getDataO(req.body, PROFILE_FIELDS);

  if (checks.isNull(data.fullName))
    return res.bad("Full name cannot be set to nothing");

  const t = await db.transaction();

  try {
    if (!checks.isNull(data.username)) {
      // TODO: check if username exists

      await user.updateUsername(userId, username, t);
    }
    delete data.username;

    await Profile.update(data, {
      where: { id: profileId },
      transaction: t,
      individualHooks: true,
    });

    await t.commit();
    res.ok("Profile Updated");
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
});

export const ProfileRouter = router;
