import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Post from "../models/Post.js";

const F_KEY = "postId";

const postAssociation = () => {
  Post.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(Post, { foreignKey: F_KEY });

  Post.hasMany(Like, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Like.belongsTo(Post, { foreignKey: F_KEY });
};

export default postAssociation;
