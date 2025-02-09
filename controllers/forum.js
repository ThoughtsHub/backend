import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";

const allowedFields = ["title", "description", "images", "handle"];

const get = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const forums = await Forum.findAll({
      attributes: { exclude: ["id", "profileId"] },
      offset,
      limit: 45,
      include: [
        {
          model: Profile,
          attributes: [
            "pfp",
            "displayName",
            "firstName",
            "lastName",
            "about",
            "handle",
          ],
        },
        {
          model: Comment,
          attributes: { exclude: ["forumId"] },
          include: [
            {
              model: Profile,
              attributes: [
                "pfp",
                "displayName",
                "firstName",
                "lastName",
                "about",
                "handle",
              ],
            },
          ],
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

const create = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body, ["handle"]);

  try {
    if (data.title === null) return res.bad("Forum Title cannot be null");
    const forumHandle = handle.create(data.title ?? req.user.username);

    const forum = await Forum.create(
      { ...data, profileId, handle: forumHandle },
      { validate: true, fields: allowedFields }
    );

    res.created("Forum Created", { forumId: forum.id });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const modify = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data, handle] = getData(req.body, ["handle"]);

  if (handle === null) return res.noParams();

  try {
    const updateResult = await Forum.update(data, {
      where: { handle, profileId },
      individualHooks: true,
      validate: true,
      fields: allowedFields,
    });

    if (updateResult !== 1) return res.bad("You don't own this forum");

    res.ok("Forum updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const remove = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.query;

  if (handle === null) return res.bad("No handle provided");

  try {
    const destroyResult = await Forum.destroy({
      where: { handle, profileId },
      individualHooks: true,
    });

    if (destroyResult !== 1) return res.bad("You don't own this forum");

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const ForumsHandler = { get, create, modify, del: remove };

export default ForumsHandler;
