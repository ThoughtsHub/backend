import Profile from "../models/Profile.js";
import User from "../models/User.js";

const writer = "writer";

export const includeWriter = {
  model: Profile,
  as: writer,
  include: {
    model: User,
    attributes: ["username"],
  },
};

export default writer;
