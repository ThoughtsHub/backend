import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import Vote from "../models/Vote.js";
import handle from "../utils/handle.js";
import ReqBody from "../utils/request.js";

const FORUM_FIELDS = ["title", "description", "image", "images", "handle"];

/**
 * Gets the forums for the user (latest)
 * @param {Request} req
 * @param {Response} res
 */
const getForums = async (req, res) => {
  const query = new ReqBody(req.query);
  query.toNumber("offset", 0);

  const offset = query.get("offset");
  try {
    const forums = await Forum.findAll({
      offset,
      limit: 30,
      order: [["createdAt", "desc"]],
      include: [
        { model: Profile, attributes: ["fullName", "about"] },
        { model: Comment, offset: 0, limit: 2, order: [["createdAt", "desc"]] },
        { model: Vote, offset: 0, limit: 4, order: [["createdAt", "desc"]] },
      ],
    });

    res.ok("Forums", { forums });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getMyForums = async (req, res) => {
  const profileId = req.user.profile.id;

  const query = new ReqBody(req.query);
  query.toNumber("offset", 0);

  const offset = query.get("offset");
  try {
    const forums = await Forum.findAll({
      where: { profileId },
      offset,
      limit: 30,
      order: [["createdAt", "desc"]],
      include: [
        { model: Comment, offset: 0, limit: 2, order: [["createdAt", "desc"]] },
        { model: Vote, offset: 0, limit: 4, order: [["createdAt", "desc"]] },
      ],
    });

    res.ok("Forums", { forums });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getSomeoneForums = async (req, res) => {
  const query = new ReqBody(req.query);
  query.toNumber("offset", 0);

  if (!query.isString("profileId")) return res.bad("Invalid profileId");

  const offset = query.get("offset");
  const profileId = query.get("profileId");
  try {
    const profile = await Profile.findByPk(profileId);
    if (profile === null) return res.bad("Invalid profileId");

    const forums = await Forum.findAll({
      where: { profileId },
      offset,
      limit: 30,
      order: [["createdAt", "desc"]],
      include: [
        { model: Comment, offset: 0, limit: 2, order: [["createdAt", "desc"]] },
        { model: Vote, offset: 0, limit: 4, order: [["createdAt", "desc"]] },
      ],
    });

    res.ok("Forums", { forums });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const createForum = async (req, res) => {
  const profileId = req.user.profile.id;
  const body = new ReqBody(req.body, [...FORUM_FIELDS, "forums"]);

  const forums = [];

  if (body.isArray("forums")) {
    for (const _ of body.get("forums")) {
      const forum = new ReqBody(_, FORUM_FIELDS);
      if (forum.anyFieldNull("title description")) return res.noParams();

      if (forum.isString("image")) forum.set("images", [forum.get("image")]);

      if (forum.fieldNotArray("images")) return res.bad("Invalid images");

      forum.del("image");
      forum.set("handle", handle.create(forum.get("title")));
      forum.set("profileId", profileId);
      forums.push(forum.values);
    }
  } else {
    if (body.anyFieldNull("title description")) return res.noParams();

    if (body.isString("image")) body.set("images", [body.get("image")]);

    if (body.fieldNotArray("images")) return res.bad("Invalid images");

    body.del("image");
    body.set("handle", handle.create(body.get("title")));
    body.set("profileId", profileId);
    forums.push(body.values);
  }

  try {
    const createResult = await Forum.bulkCreate(forums);

    res.ok(`Forum${forums.length === 1 ? "" : "s"} Created`, { forums });
  } catch (err) {
    console.log(err);
  }
};

const replaceForum = async (req, res) => {
  const body = new ReqBody(req.body, FORUM_FIELDS);
  const forumId = req.forumId;

  if (body.anyFieldNull("title description")) return res.noParams();

  if (body.isString("image")) body.set("images", [body.get("image")]);

  if (body.fieldNotArray("images")) return res.bad("Invalid images");

  const fields = body.bulkGetMap("title description images");
  try {
    const [updateResult] = await Forum.update(fields, {
      where: { id: forumId },
    });

    if (updateResult === 1) return res.ok("Forum Updated", { ...fields });
  } catch (err) {
    console.log(err);
  }

  res.serverError();
};

const updateForum = async (req, res) => {
  const body = new ReqBody(req.body, FORUM_FIELDS);
  const forumId = req.forumId;

  body.clearNulls();
  body.del("image");
  body.del("handle");

  try {
    const [updateResult] = await Forum.update(body.values, {
      where: { id: forumId },
    });

    if (updateResult === 1) return res.ok("Forum Updated", { ...body.values });
  } catch (err) {
    console.log(err);
  }

  res.serverError();
};

const deleteForum = async (req, res) => {
  const forumId = req.forumId;

  try {
    const deleteResult = await Forum.destroy({ where: { id: forumId } });

    if (deleteResult === 1) return res.ok("Forum Deleted", { forumId });
  } catch (err) {
    console.log(err);
  }

  res.serverError();
};

export const ForumController = {
  getForums,
  getMyForums,
  getSomeoneForums,
  createForum,
  replaceForum,
  updateForum,
  deleteForum,
};
