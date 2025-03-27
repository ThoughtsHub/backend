import Profile from "../models/Profile.js";

const writer = "writer";

export const includeWriter = {
  model: Profile,
  as: writer,
};

export default writer;
