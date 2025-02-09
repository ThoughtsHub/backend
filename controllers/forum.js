import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import getData from "../utils/request.js";

const getForums = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const forums = await Forum.findAll({
      attributes: { exclude: ["id", "profileId"] },
      offset,
      limit: 45,
      include: [
        {
          model: Profile,
          attributes: ["pfp", "displayName", "firstName", "lastName", "about"],
        },
      ],
      order: [["updatedAt", "desc"]],
    });

    res.ok("Forums", { forums });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const createForum = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body, ["handle", "profileId", "id"]);

  try {
    const forum = await Forum.create(
      { ...data, profileId },
      { validate: true }
    );

    res.created("Forum Created", { forumId: forum.id });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const updateForum = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data, handle] = getData(req.body, [
    "handle",
    "forumId",
    "profileId",
    "id",
  ]);

  if (handle === null) return res.noParams();

  try {
    const updateResult = await Forum.update(data, {
      where: { handle, profileId },
      individualHooks: true,
      validate: true,
    });

    if (updateResult !== 1) return res.bad("You don't own this forum");

    res.ok("Forum updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const removeForum = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.query;

  if (handle === null) return res.bad("No handle provided");

  try {
    const destroyResult = await Forum.destroy({
      where: { handle, profileId },
      individualHooks: true,
    });

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const handler = {
  get: getForums,
  create: createForum,
  modify: updateForum,
  del: removeForum,
};

export default handler;
