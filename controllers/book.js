import Book from "../models/Book.js";
import Profile from "../models/Profile.js";
import { SavedListBooks } from "../models/SavedList.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";

const allowedFields = [
  "title",
  "author",
  "isbn10",
  "isbn13",
  "genre",
  "publicationYear",
  "publisher",
  "language",
  "pageCount",
  "summary",
  "coverImage",
  "price",
  "sectionPrice",
  "pagePrice",
  "stock",
  "content",
  "handle",
];

const get = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const books = await Book.findAll({
      attributes: { exclude: ["id"] },
      offset,
      limit: 45,
    });

    res.ok("Books", { books });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getByHandle = async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) return res.noParams();

  try {
    const book = await Book.findOne({
      where: { handle },
      attributes: { exclude: ["id"] },
    });

    if (book === null) return res.bad("Invalid book handle");

    res.ok("Found Book", { book });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const create = async (req, res) => {
  const [data] = getData(req.body, ["handle"]);

  if ([data.isbn10, data.title].includes(null)) return res.noParams();

  const bookHandle = handle.create(data.title, data.isbn10);

  try {
    const book = await Book.create(
      { ...data, handle: bookHandle },
      {
        validate: true,
        fields: allowedFields,
      }
    );

    res.created("Book Created", { bookHandle: book.handle });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const modify = async (req, res) => {
  const [data, handle] = getData(req.body, ["handle"]);

  if (handle === null) return res.noParams();

  try {
    const [updateResult] = await Book.update(
      { ...data },
      { where: { handle }, validate: true, fields: allowedFields }
    );

    if (updateResult !== 1) return res.bad("Invalid handle");

    res.ok("Book updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const remove = async (req, res) => {
  const { handle = null } = req.query;

  if (handle === null) return res.noParams();

  try {
    const destroyResult = await Book.destroy({ where: { handle } });
    if (destroyResult !== 1) return res.bad("Invalid handle");

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getSavedBoooks = async (req, res) => {
  const profileId = req.user.profile.id;

  try {
    const profile = await Profile.findByPk(profileId);

    const savedBooks = await profile.getBooks({
      attributes: { exclude: ["id"] },
    });

    res.ok("Books", { books: savedBooks });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const save = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.body;

  if (handle === null) res.noParams();

  try {
    const book = await Book.findOne({ where: { handle } });
    if (book === null) return res.bad("Invalid handle");

    const savedResult = await SavedListBooks.create({
      profileId,
      bookId: book.id,
    });

    res.ok("Saved");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const unsave = async (req, res) => {
  const profileId = req.user.profile.id;

  const { handle = null } = req.query;
  if (handle === null) return res.noParams();

  try {
    const book = await Book.findOne({ where: { handle } });
    if (book === null) return res.bad("Invalid handle");

    const destroyResult = await SavedListBooks.destroy({
      where: { profileId, bookId: book.id },
      individualHooks: true,
    });

    if (destroyResult !== 1) return res.bad("Never saved this book");

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const BookHandler = {
  get,
  getByHandle,
  create,
  modify,
  del: remove,
  getSavedBoooks,
  save,
  unsave,
};

export default BookHandler;
