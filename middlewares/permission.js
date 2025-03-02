import Forum from "../models/Forum.js";
import ReqBody from "../utils/request.js";

/**
 * Checks if the forum belongs to user
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const forumBelongsToUser = async (req, res, next) => {
  const profileId = req.user.profile.id;
  const body = req.body;

  if (body.isNull("forumId")) return res.noParams(["forumId"]);
  if (!body.isString("forumId")) return res.bad("Invalid forum Id");

  const forum = await Forum.findOne({
    where: { id: body.get("forumId"), profileId },
  });
  if (forum === null) return res.bad("Invalid forum Id");

  req.forumId = body.get("forumId");
  next();
};

const permissions = { forumBelongsToUser };

export default permissions;
