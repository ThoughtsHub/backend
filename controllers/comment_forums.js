import { db } from "../db/connect.js";
import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import handle from "../utils/handle.js";

const get = async (req, res) => {
  const { forumHandle = null, offset = 0 } = req.query;

  if (forumHandle === null) return res.noParams();

  try {
    const forum = await Forum.findOne({ where: { handle: forumHandle } });
    if (forum === null) return res.bad("Invalid forum handle");

    const comments = await Comment.findAll({
      attributes: { exclude: ["id"] },
      offset,
      limit: 45,
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
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });

    res.ok("Comments", { comments });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const comment = async (req, res) => {
  const profileId = req.user.profile.id;

  const { forumHandle = null, body = null } = req.body;

  if ([forumHandle, body].includes(null)) return res.noParams();

  const t = await db.transaction();
  try {
    const forum = await Forum.findOne({ where: { handle: forumHandle } });
    if (forum === null) {
      await t.rollback();
      return res.bad("Invalid handle");
    }

    const commentHandle = handle.create(req.user.username);

    const comment = await Comment.create(
      {
        profileId,
        forumId: forum.id,
        body,
        handle: commentHandle,
      },
      { transaction: t }
    );
    await t.commit();

    res.created("Commented", { commentHandle });
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const remove = async (req, res) => {
  const profileId = req.user.profile.id;

  const { commentHandle = null, forumHandle = null } = req.query;

  if ([commentHandle, forumHandle].includes(null)) return res.noParams();

  const t = await db.transaction();
  try {
    const forum = await Forum.findOne({ where: { handle: forumHandle } });
    if (forum === null) {
      await t.rollback();
      return res.bad("Invalid forum handle");
    }

    const comment = await Comment.findOne({
      profileId,
      forumId: forum.id,
      handle: commentHandle,
    });
    if (comment === null) {
      await t.rollback();
      return res.bad("Invalid comment handle, or not your comment");
    }

    const destroyResult = await Comment.destroy({
      where: { profileId, forumId: forum.id, handle: commentHandle },
      individualHooks: true,
      transaction: t,
    });
    await t.commit();

    res.deleted();
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const CommentHandler = { getComments: get, comment, uncomment: remove };

export default CommentHandler;
