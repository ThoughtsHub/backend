import News from "../models/News.js";
import _req from "../utils/request.js";
import handle from "../utils/handle.js";

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

    news = {
      ...news.get({ plain: true }),
      image: news.images[0],
    };
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
  const { title, description, image, images, tags, category, newsUrl, news } =
    _req.getDataO(req.body, [...NEWS_FIELDS, "news"]);

  const _news = [];
  if (Array.isArray(news)) {
    for (const n of news) {
      const newsData = _req.getDataO(n, NEWS_FIELDS);

      if (typeof newsData.image === "string") newsData.images = [image];
      delete newsData.image;

      if (!Array.isArray(newsData.images)) return res.bad("No image given");

      if (
        _req.anyNull(
          newsData.title,
          newsData.description,
          newsData.images,
          newsData.newsUrl
        )
      )
        return res.noParams();

      newsData.handle = handle.create(newsData.title);

      _news.push(newsData);
    }
  } else {
    if (typeof image === "string") images = [image];

    if (!Array.isArray(images)) return res.bad("No image given");

    if (_req.anyNull(title, description, images, newsUrl))
      return res.noParams();

    const newsHandle = handle.create(title);

    _news.push({
      title,
      description,
      images,
      tags,
      category,
      newsUrl,
      handle: newsHandle,
    });
  }

  try {
    const news = await News.bulkCreate(_news);

    res.created("News Created", { news: _news });
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
