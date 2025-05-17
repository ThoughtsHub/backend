import Category from "../models/Category.js";
import News from "../models/News.js";

export const NewsAssociation = () => {
  Category.hasMany(News, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    as: "news",
  });
  News.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
};
