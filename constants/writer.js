import Profile from "../models/Profile.js";

const writer = "writer";

export const includeWriter = {
  model: Profile,
  as: writer,
  attributes: {
    include: [["id", "profileId"]],
    exclude: ["id"],
  },
};

export default writer;
