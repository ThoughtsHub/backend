import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import { ForumComment_ } from "../services/ForumCommentService.js";
import { Forum_ } from "../services/ForumService.js";

await connectToPg();
await initLink();

const countAllLikes = async () => {
  const forums = await Forum.findAll();
  for (const forum of forums) {
    const likes = await ForumAppreciation.count({
      where: { forumId: forum.id },
    });
    const comments = await ForumComment.count({where : {forumId: forum.id}} );
    const result = await Forum.update({appreciations: likes, comments}, {where: {forumId: forum.id}})
  }
};

await countAllLikes();
