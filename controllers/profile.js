import Profile from "../models/Profile.js";
import Education from "../models/Education.js";
import Skill from "../models/Skill.js";
import getData from "../utils/request.js";
import User from "../models/User.js";

const allowedFields = ["fullName", "about", "gender", "dob"];

const get = async (req, res) => {
  const profileId = req.user.profile.id;

  try {
    const profile = await Profile.findByPk(profileId, {
      attributes: { exclude: ["userId", "id"] },
      include: [
        {
          model: Education,
          as: "education",
          attributes: { exclude: ["profileId"] },
          include: Skill,
        },
      ],
    });

    // a profile should have a username
    const _profile = {
      username: req.user.username,
      ...profile.get({ plain: true }),
    };

    res.ok("Your Profile", { profile: _profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getByUsername = async (req, res) => {
  const { username = null } = req.params;

  if (username === null) return res.noParams();

  try {
    const user = await User.findOne({ where: { username } });

    if (user === null) return res.bad("Invalid username");

    const profile = await Profile.findOne({
      where: { userId: user.id },
      attributes: { exclude: ["userId", "id"] },
      include: [
        {
          model: Education,
          as: "education",
          attributes: { exclude: ["profileId"] },
          include: Skill,
        },
      ],
    });

    // a profile should have a username
    const _profile = {
      username: req.user.username,
      ...profile.get({ plain: true }),
    };

    res.ok("Profile information", { profile: _profile });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const update = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body);

  if (data.dob !== null) data.dob = Date(data.dob);

  try {
    const updateResult = await Profile.update(data, {
      where: { id: profileId },
      individualHooks: true,
      validate: true,
      fields: allowedFields,
    });

    res.ok("Profile created");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const removeProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;
  const { key } = req.params;

  if (["firstName", "age", "about", "pfp"].includes(key))
    return res.bad("First Name cannot be deleted");

  if (!allowedFields.includes(key)) return res.bad("setting unallowed key");

  const updateData = {}; // set updateData
  updateData[key] = null; // key is string, cannot use dot operator, or else
  // the key will be 'key' not key

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
      fields: allowedFields,
    });

    res.ok("Attribute set to null");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const ProfileHandler = {
  get,
  getByUsername,
  update,
  del: removeProfileAttribute,
};

export default ProfileHandler;
