import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { Forum_ } from "../services/ForumService.js";
import { User_ } from "../services/UserService.js";

await connectToPg();
await initLink();

const updateForumCounts = async () => {
  const profiles = await Profile.findAll();
  for (const profile of profiles) {
    const pid = profile.id;

    const forumCount = await Forum.count({ where: { profileId: pid } });
    await Profile.update({ forums: forumCount }, { where: { id: pid } });
  }
};

await updateForumCounts();
