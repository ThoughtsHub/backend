import { onDelete } from "../constants/hooks.js";
import Profile from "../models/Profile.js";
import Story from "../models/Story.js";
import StoryComment from "../models/StoryComment.js";
import StoryLike from "../models/StoryLike.js";
import { profileKey } from "./profile.js";

export const storyKey = "storyId";

const storyAssociations = () => {
  Story.hasMany(StoryLike, { foreignKey: storyKey });
  Profile.hasMany(StoryLike, { foreignKey: profileKey });
  StoryLike.belongsTo(Story, { foreignKey: storyKey });
  StoryLike.belongsTo(Profile, { foreignKey: profileKey });

  Story.hasMany(StoryComment, { foreignKey: storyKey });
  Profile.hasMany(StoryComment, { foreignKey: profileKey });
  StoryComment.belongsTo(Story, { foreignKey: storyKey });
  StoryComment.belongsTo(Profile, { foreignKey: profileKey });
};

export default storyAssociations;
