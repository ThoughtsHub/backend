import _req from "../utils/request.js";
import checks from "../utils/checks.js";
import { db } from "../db/clients.js";
import Profile from "../models/Profile.js";
import user from "../utils/user.js";
import School from "../models/School.js";
import User from "../models/user.js";

const PROFILE_FIELDS = ["fullName", "about", "gender", "dob"];

/**
 * gets the profile with the requested profile Id
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const getProfile = async (req, res) => {
  const { id = null } = req.query;

  if (id === null) return res.noParams();

  try {
    let profile = await Profile.findByPk(id, {
      attributes: { exclude: ["userId"] },
      include: [
        { model: School, attributes: { exclude: ["profileId", "id"] } },
      ],
    });

    profile = {
      ...profile.get({ plain: true }),
      username: req.user.username,
      isUsernameSet: req.user.usernameSet,
    };

    res.ok("Requested Profile", { profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * gets the user's profile
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const getMyProfile = async (req, res) => {
  const profileId = req.user.profile?.id;

  try {
    let profile = await Profile.findByPk(profileId, {
      attributes: { exclude: ["userId"] },
      include: [
        { model: School, attributes: { exclude: ["profileId", "id"] } },
      ],
    });

    profile = {
      ...profile.get({ plain: true }),
      username: req.user.username,
      isUsernameSet: req.user.usernameSet,
    };

    res.ok("Your Profile", { profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * Same as getProfile, but works instead by using
 * profile's handle
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const getProfileByHandle = async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) return res.noParams();

  try {
    let profile = await Profile.findOne({
      where: { handle },
      include: [{ model: User }],
    });
    if (profile === null) return res.bad("Invalid profile handle");

    profile = {
      ...profile.get({ plain: true }),
      username: profile.User.username,
      isUsernameSet: !(profile.User.username === null),
    };

    res.ok("Profile Found", { profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * creates a profile for user
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const createProfile = async (req, res) => {
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
};

/**
 * replaces the current profile information with
 * new information
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const replaceProfile = async (req, res) => {
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
};

/**
 * updates some features of the profile
 * with given values
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const fixProfile = async (req, res) => {
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
};

export const ProfileController = {
  getProfile: {
    id: getProfile,
    mine: getMyProfile,
    handle: getProfileByHandle,
  },
  createProfile,
  fixProfile,
  replaceProfile,
};
