import Profile from "../models/Profile.js";
import Education from "../models/Education.js";
import Skill from "../models/Skill.js";
import getData from "../utils/request.js";

const profileKeys = [
  "firstName",
  "middleName",
  "lastName",
  "pfp",
  "displayName",
  "about",
  "age",
];

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

const update = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body, ["handle", "userId", "id", "profileId"]);

  if (typeof data.firstName === "string")
    return res.bad("First name cannot be empty");

  try {
    const updateResult = await Profile.update(data, {
      where: { id: profileId },
      individualHooks: true,
      validate: true,
    });

    res.ok("Profile Updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const updateProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;

  const { key, value } = req.params;

  if (!profileKeys.includes(key)) return res.bad("Bad key update request");

  const updateData = {};
  updateData[key] = value;

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
      validate: true,
    });

    res.ok("Attribute updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const removeProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;
  const { key } = req.params;

  if (!profileKeys.includes(key)) return res.bad("Bad key delete request");

  if (key === "firstName") return res.bad("First Name cannot be deleted");

  const updateData = {}; // set updateData
  updateData[key] = null; // key is string, cannot use dot operator, or else
  // the key will be 'key' not key

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
    });

    res.ok("Attribute set to null");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const ProfileHandler = {
  get,
  update: {
    profile: update,
    attribute: updateProfileAttribute,
  },
  del: removeProfileAttribute,
};

export default ProfileHandler;
