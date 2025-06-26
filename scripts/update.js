import { initLink } from "../associations/link.js";
import { closePg, connectToPg } from "../db/pg.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import Institute from "../models/Institute.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { Forum_ } from "../services/ForumService.js";
import { User_ } from "../services/UserService.js";
import updateLoader from "../utils/loader.js";
import { generateInstituteAbout } from "./instituteAbout.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await connectToPg();
await initLink();

const updateAbout = async () => {
  let institutes = await Institute.findAll({
    where: { about: null },
    attributes: { exclude: ["createDate", "updateDate"] },
  });
  institutes = institutes.map((i) => i.get({ plain: true }));

  let x = 0,
    y = institutes.length;
  for (let inst of institutes) {
    let instB = { ...inst };
    delete instB.id;
    delete instB.universityId;

    let about = await generateInstituteAbout(instB);
    await Institute.update({ about }, { where: { id: inst.id } });
    await sleep(4000);
    x += 1;
    updateLoader(x, y);
  }
};

// await updateForumCounts();
await updateAbout();

await closePg();
