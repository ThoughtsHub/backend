import Comment from "../models/Comment.js";
import Creativity from "../models/Creativity.js";
import Like from "../models/Like.js";
import Profile from "../models/Profile.js";

const creativityAssociations = () => {
  // creativity has comments
  Creativity.hasMany(Comment, {
    foreignKey: "creativityId",
    onDelete: "CASCADE",
  });
  Comment.belongsTo(Creativity, { foreignKey: "creativityId" });

  // creativity can have likes
  Profile.belongsToMany(Creativity, {
    through: Like,
    foreignKey: "profileId",
    otherKey: "creativityId",
  });
  Creativity.belongsToMany(Profile, {
    through: Like,
    foreignKey: "creativityId",
    otherKey: "profileId",
  });
};

export default creativityAssociations;
