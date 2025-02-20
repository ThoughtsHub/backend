import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import PoemPost from "../models/PoemPost.js";

const F_KEY = "poemPostId";

const poemPostAssociation = () => {
  PoemPost.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(PoemPost, { foreignKey: F_KEY });

  PoemPost.hasMany(Like, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Like.belongsTo(PoemPost, { foreignKey: F_KEY });
};

export default poemPostAssociation;
