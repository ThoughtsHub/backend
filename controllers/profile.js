import Profile from "../models/Profile.js";
import c from "../utils/status_codes.js";
import Education from "../models/Education.js";
import Skill from "../models/Skill.js";

const profileKeys = [
  "firstName",
  "middleName",
  "lastName",
  "pfp",
  "displayName",
  "about",
  "age",
];

const getProfile = async (req, res) => {
  const profileId = req.user.profile.id;

  try {
    const profile = await Profile.findByPk(profileId, {
      attributes: { exclude: ["userId", "id"] },
      include: [
        {
          model: Education,
          as: "education",
          attributes: { exclude: ["id", "profileId", "skillId"] },
          include: Skill,
        },
      ],
    });

    // a profile should have a username
    const _profile = {
      username: req.user.username,
      ...profile.get({ plain: true }),
    };

    res.status(c.OK).json({ message: "Your Profile", profile: _profile });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const profileId = req.user.profile.id;

  const {
    pfp = null,
    firstName = null,
    middleName = null,
    lastName = null,
    about = null,
    displayName = null,
    age = null,
  } = req.body;

  const updateData = Object.fromEntries(
    Object.entries({
      pfp,
      firstName,
      lastName,
      middleName,
      displayName,
      about,
      age,
    }).filter(([_, value]) => value != null)
  );

  if (typeof updateData.firstName === "string")
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "First name cannot be empty" });

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
    });

    res.status(c.OK).json({ message: "Profile updated" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const updateProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;

  const { key, value } = req.params;

  if (!profileKeys.includes(key))
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "Bad key update request" });

  const updateData = {};
  updateData[key] = value;

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
    });

    console.log(updateResult);

    res.status(c.OK).json({ message: "Attribute updated" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const deleteProfileAttribute = async (req, res) => {
  const profileId = req.user.profile.id;
  const { key } = req.params;

  if (!profileKeys.includes(key))
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "Bad key delete request" });

  if (key === "firstName")
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "First Name cannot be deleted" });

  const updateData = {}; // set updateData
  updateData[key] = null; // key is string, cannot use dot operator, or else
  // the key will be 'key' not key

  try {
    const updateResult = await Profile.update(updateData, {
      where: { id: profileId },
      individualHooks: true,
    });

    res.status(c.OK).json({ message: "Attribute set to null" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const handler = {
  get: getProfile,
  update: {
    profile: updateProfile,
    attribute: updateProfileAttribute,
  },
  delete: deleteProfileAttribute,
};

export default handler;
