import _env from "../constants/env.js";
import News from "../models/News.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";

const allowedFields = [
  "title",
  "content",
  "images",
  "tags",
  "category",
  "handle",
];

const get = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const news = await News.findAll({
      attributes: { exclude: ["id"] },
      order: [["createdAt", "desc"]],
      offset,
      limit: 30,
    });

    res.ok("News", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const create = async (req, res) => {
  const [data] = getData(req.body, ["handle"]);

  const reqParams = [data.title, data.content];
  if (reqParams.includes(undefined) || reqParams.includes(null))
    return res.noParams();

  try {
    const newsHandle = handle.create(data.title);

    await News.create(
      { ...data, handle: newsHandle },
      { validate: true, fields: allowedFields }
    );

    res.created("News created");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const modify = async (req, res) => {
  const [data, newsHandle] = getData(req.body, ["handle"]);

  try {
    await News.update(
      { ...data },
      { where: { handle: newsHandle }, validate: true, fields: allowedFields }
    );

    res.ok("News updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const remove = async (req, res) => {
  const { handle = null } = req.query;

  if (handle === null) return res.bad("No handle given");

  try {
    const destroyResult = await News.destroy({
      where: { handle },
      individualHooks: true,
    });

    if (destroyResult !== 1) return res.bad("No news like that to delete");

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const NewsHandler = { get, create, del: remove, modify };

export default NewsHandler;
