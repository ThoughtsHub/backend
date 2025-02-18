import { Router } from "express";
import _req from "../utils/request.js";
import auth from "../middlewares/auth.js";
import checks from "../utils/checks.js";
import { db } from "../db/clients.js";
import Profile from "../models/Profile.js";
import user from "../utils/user.js";
import School from "../models/School.js";

const router = Router();

const PROFILE_FIELDS = ["fullName", "about", "gender", "dob"];

router.get("/me", auth.login, auth.profile, async (req, res) => {
  const profileId = req.user.profile?.id;

  let profile = await Profile.findByPk(profileId, {
    attributes: { exclude: ["userId", "id"] },
    include: [{ model: School, attributes: { exclude: ["profileId", "id"] } }],
  });

  profile = {
    ...profile.get({ plain: true }),
    username: req.user.username,
    isUsernameSet: req.user.usernameSet,
  };

  res.ok("Your Profile", { profile });
});

router.get("/h/:handle", async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) return res.noParams();

  try {
    const profile = await Profile.findOne({ where: { handle } });
    if (profile === null) return res.bad("Invalid profile handle");
    res.ok("Profile Found", { profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.post("/", auth.login, async (req, res) => {
  const userId = req.user.id;
  const profile = req.user.isProfile;
  const profileId = req.user.profile?.id;

  const {
    fullName,
    about,
    gender,
    dob: rawDob,
    username,
  } = _req.getDataO(req.body, PROFILE_FIELDS);

  if (checks.isNull(fullName) && !auth.profile)
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

    if (profile)
      await Profile.update(fields, {
        where: { id: profileId },
        transaction: t,
        individualHooks: true,
      });
    else await Profile.create({ ...fields, userId }, { transaction: t });

    await t.commit();
    res.ok(`Profile ${auth.profile ? "upda" : "crea"}ted`, {});
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
});

router.patch("/", auth.login, auth.profile, async (req, res) => {
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

router.put("/", auth.login, auth.profile, async (req, res) => {
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
