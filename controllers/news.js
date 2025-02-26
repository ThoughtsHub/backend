import News from "../models/News.js";
import handle from "../utils/handle.js";
import ReqBody from "../utils/request.js";

const NEWS_FIELDS = [
  "title",
  "description",
  "images",
  "tags",
  "category",
  "image",
  "newsUrl",
];

/**
 * Gets the latest news
 * @param {Request} req
 * @param {Response} res
 */
const getNews = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    let news = await News.findAll({
      attributes: { exclude: ["id"] },
      offset,
      limit: 30,
      order: [["createdAt", "desc"]],
    });

    const _news = [];
    for (const n of news) {
      let nData = {
        ...n.get({ plain: true }),
        image: n.images[0],
      };
      delete nData.images;
      _news.push(nData);
    }

    news = _news;

    res.ok("News", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * creates a single news or in bulk
 * @param {Request} req
 * @param {Response} res
 */
const createNews = async (req, res) => {
  const body = new ReqBody(req.body, [...NEWS_FIELDS, "news"]);

  const news = [];
  if (Array.isArray(body.get("news"))) {
    for (const n of body.get("news")) {
      const newsData = new ReqBody(n, NEWS_FIELDS);

      const image = newsData.get("image");
      if (typeof image === "string") newsData.set("images", [image]);
      newsData.del("image");

      if (newsData.fieldNotArray("images")) return res.bad("No image given");

      if (newsData.anyFieldNull("title description images newsUrl"))
        return res.noParams();

      newsData.set("handle", handle.create(newsData.get("title")));

      news.push(newsData);
    }
  } else {
    const image = body.get("image");
    if (typeof image === "string") body.set("images", [image]);

    if (body.fieldNotArray("images")) return res.bad("No image given");

    if (body.anyFieldNull("title description images newsUrl"))
      return res.noParams();

    body.set("handle", handle.create(body.get("title")));

    news.push(body);
  }

  try {
    const createResult = await News.bulkCreate(news);

    res.created("News Created", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * updates the news by its id
 * @param {Request} req
 * @param {Response} res
 */
const updateNews = async (req, res) => {
  const { title, description, image, images, tags, category, id } =
    _req.getDataO(req.body, [...NEWS_FIELDS, "id"]);

  if (typeof image === "string") images = [image];

  if (!Array.isArray(images)) return res.bad("No image given");

  if (_req.anyNull(title, description, images, id)) return res.noParams();

  try {
    const [updated] = await News.update(
      { title, description, images, tags, category },
      { where: { id }, individualHooks: true }
    );

    if (updated !== 1) return res.bad("Invalid news id");

    const news = await News.findOne({ where: { id } });
    res.ok("News updated", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * removes the requested (id) news
 * @param {Request} req
 * @param {Response} res
 */
const deleteNews = async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) res.noParams();

  try {
    const destoryResult = await News.destroy({
      where: { handle },
      individualHooks: true,
    });

    if (destoryResult === 1) return res.ok("News Deleted");
    res.bad("Invalid news handle");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const NewsController = { getNews, createNews, updateNews, deleteNews };
