import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import Vote from "../models/Vote.js";
import ReqBody from "../utils/request.js";

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

export const ForumController = { getForums, getMyForums, getSomeoneForums };
