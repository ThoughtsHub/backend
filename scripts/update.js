import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import News from "../models/News.js";
import { ForumComment_ } from "../services/ForumCommentService.js";
import { Forum_ } from "../services/ForumService.js";
import { News_ } from "../services/NewsService.js";

await connectToPg();
await initLink();

const updateNewsStatus = async () => {
  const news = await News.findAll();
  for (const n of news) {
    let result = News_.update({ status: "Published" }, n.id);
  }
};

await updateNewsStatus()