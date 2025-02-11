import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";
import CommentHandler from "./comment_forums.js";
import VoteHandler from "./vote_forums.js";

const allowedFields = ["title", "description", "images", "handle", "profileId"];

const getForums = async (where = {}, offset, res) => {
  try {
    const forums = await Forum.findAll({
      where,
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

const get = async (req, res) => {
  const { offset = 0 } = req.query;

  await getForums({}, offset, res);
};

const getUsers = async (req, res) => {
  const profileId = req.user.profile.id;
  const { offset = 0 } = req.query;

  await getForums({ profileId }, offset, res);
};

const getByUsername = async (req, res) => {
  const { offset = 0 } = req.query;

  const { username = null } = req.params;

  if (username === null) return res.noParams();

  try {
    const user = await User.findOne({ where: { username } });
    if (user === null) return res.bad("Invalid username");

    const profile = await Profile.findOne({ where: { userId: user.id } });
    if (profile === null) return res.bad("Invalid username");

    await getForums({ profileId: profile.id }, offset, res);
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getByHandle = async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) return res.noParams();

  try {
    const forum = await Forum.findOne({
      where: { handle },
      attributes: { exclude: ["id", "profileId"] },
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
          limit: 1,
          order: [["createdAt", "desc"]],
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
    });

    if (forum === null) return res.bad("Invalid handle");

    res.ok("Forum found", { forum });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const create = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body, ["handle", "profileId"]);

  try {
    if (data.title === null) return res.bad("Forum Title cannot be null");
    const forumHandle = handle.create(data.title ?? req.user.username);

    const forum = await Forum.create(
      { ...data, profileId, handle: forumHandle },
      { validate: true, fields: allowedFields }
    );

    res.created("Forum Created", { forumHandle: forum.handle });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const modify = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data, handle] = getData(req.body, ["handle", "profileId"]);

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

const ForumsHandler = {
  get,
  getUsers,
  getByUsername,
  getByHandle,
  create,
  modify,
  del: remove,
  ...VoteHandler,
  ...CommentHandler,
};

export default ForumsHandler;
