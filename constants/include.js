import Follower from "../models/Follower.js";
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

export const includeProfile = {
  model: Profile,
  as: "profile",
  attributes: {
    include: [["id", "profileId"]],
    exclude: ["id"],
  },
};

export const includeProfileNOTAs = {
  model: Profile,
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

export const includeWriterWith = (profileId, noAs = false, as = "writer") => ({
  model: Profile,
  ...(!noAs ? { as } : {}),
  attributes: {
    include: [["id", "profileId"]],
    exclude: ["id"],
  },
  include: [
    {
      model: Follower,
      as: "follow",
      required: false,
      where: { followerId: profileId },
    },
  ],
});

export const includeFollower = (profileId) => ({
  model: Follower,
  as: "follow",
  required: false,
  where: { followerId: profileId },
});
