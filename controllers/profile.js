import Profile from "../models/Profile.js";
import Education from "../models/Education.js";
import Skill from "../models/Skill.js";
import getData from "../utils/request.js";

const allowedFields = [
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

  const [data] = getData(req.body);

  if (typeof data.firstName === "string")
    return res.bad("First name cannot be empty");

  try {
    const updateResult = await Profile.update(data, {
      where: { id: profileId },
      individualHooks: true,
      validate: true,
      fields: allowedFields,
    });

    res.ok("Profile Updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const removeProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;
  const { key } = req.params;

  if (key === "firstName") return res.bad("First Name cannot be deleted");

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
  update,
  del: removeProfileAttribute,
};

export default ProfileHandler;
