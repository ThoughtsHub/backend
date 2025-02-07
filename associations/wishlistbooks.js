import Book from "../models/Book.js";
import Profile from "../models/Profile.js";
import { WishListBook } from "../models/WishListBook.js";

const wishListBooksAssociations = () => {
  // user can have a wishlist of books
  Profile.belongsToMany(Book, {
    through: WishListBook,
    foreignKey: "profileId",
    otherKey: "bookId",
  });
  Book.belongsToMany(Profile, {
    through: WishListBook,
    foreignKey: "bookId",
    otherKey: "profileId",
  });
};

export default wishListBooksAssociations;
