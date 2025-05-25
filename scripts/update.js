import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import User from "../models/User.js";
import { Forum_ } from "../services/ForumService.js";
import { User_ } from "../services/UserService";

await connectToPg();
await initLink();

const updateUserPasswords = async () => {
  const users = await User.findAll();
  for (const user of users) {
    const result = await User_.updatePassword(user.password, user.id);
  }
};

const countAllLikes = async () => {
  const forums = await Forum.findAll();
  for (const forum of forums) {
    const likes = await ForumAppreciation.count({
      where: { forumId: forum.id },
    });
    const comments = await ForumComment.count({ where: { forumId: forum.id } });
    const result = await Forum_.update(
      { appreciations: likes, comments: comments },
      forum.profileId,
      forum.id
    );
  }
};

await updateUserPasswords();
await countAllLikes();
