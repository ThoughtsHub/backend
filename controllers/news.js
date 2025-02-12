import _env from "../constants/env.js";
import News from "../models/News.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";

const allowedFields = [
  "title",
  "description",
  "images",
  "tags",
  "category",
  "handle",
];

const get = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const news = await News.findAll({
      attributes: [
        "title",
        "description",
        "images",
        "handle",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "desc"]],
      offset,
      limit: 30,
    });

    // console.log(news);
    const _news = news.map((x) => {
      return {
        ...x.get({ plain: true }),
        shareUrl: `${_env.baseUrl}/news/${x.handle}`,
      };
    });

    res.ok("News", { news: _news, offsetNext: offset + news.length });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const getByHandle = async (req, res) => {
  const { handle } = req.params;

  try {
    const news = await News.findOne({
      where: { handle },
      attributes: [
        "title",
        "description",
        "images",
        "handle",
        "createdAt",
        "updatedAt",
      ],
    });

    const _news = {
      ...news.get({ plain: true }),
      shareUrl: `${_env.baseUrl}/news/${news.handle}`,
    };

    res.ok("News", { news: _news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const create = async (req, res) => {
  const [data] = getData(req.body, ["handle"]);

  const reqParams = [data.title, data.description];
  if (reqParams.includes(undefined) || reqParams.includes(null))
    return res.noParams();

  try {
    const newsHandle = handle.create(data.title);

    await News.create(
      { ...data, handle: newsHandle },
      { fields: allowedFields }
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

const NewsHandler = { get, getByHandle, create, del: remove, modify };

export default NewsHandler;
