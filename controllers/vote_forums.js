import { db } from "../db/connect.js";
import Forum from "../models/Forum.js";
import Vote, { UPVOTE } from "../models/Vote.js";

const upvote = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.query;
  if (handle === null) return res.noParams();

  const t = await db.transaction();
  try {
    const forum = await Forum.findOne({ where: { handle } });
    if (forum === null) return res.bad("Invalid forum");

    const hasVoted = await Vote.findOne({
      where: { profileId, forumId: forum.id },
    });
    let vote;
    if (hasVoted === null)
      vote = await Vote.create({ profileId, forumId: forum.id, type: UPVOTE });
    else
      vote = await Vote.update(
        { type: UPVOTE },
        { where: { id: hasVoted.id } }
      );

    await t.commit();

    res.ok("Upvoted");
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const unvote = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.query;
  if (handle === null) return res.noParams();

  const t = await db.transaction();
  try {
    const forum = await Forum.findOne({ where: { handle } });
    if (forum === null) return res.bad("Invalid forum");

    const hasVoted = await Vote.findOne({
      where: { profileId, forumId: forum.id },
    });
    if (hasVoted === null) {
      await t.rollback();
      return res.bad("Cannot unvote, when there is no vote of you");
    }

    const destroyResult = await Vote.destroy({
      where: { id: hasVoted.id },
      individualHooks: true,
    });

    await t.commit();

    res.deleted();
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const VoteHandler = { upvote, unvote };

export default VoteHandler;
