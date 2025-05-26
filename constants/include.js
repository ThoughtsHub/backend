import ForumAppreciation from "../models/Forum_Appreciation.js";
import Profile from "../models/Profile.js";

export const includeWriter = {
  model: Profile,
  as: "writer",
  attributes: {
    include: [["id", "profileId"]],
    exclude: ["id"],
  },
};

export const includeReporter = {
  model: Profile,
  as: "reporter",
  attributes: {
    include: [["id", "profileId"]],
    exclude: ["id"],
  },
};

export const includeAppreciation = (profileId) => ({
  model: ForumAppreciation,
  as: "appreciations_",
  required: false,
  where: { profileId, value: 1 },
});
