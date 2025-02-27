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
  const query = new ReqBody(req.query);
  if (query.isNull("offset")) query.set("offset", 0);

  try {
    let news = await News.findAll({
      attributes: { exclude: ["id"] },
      offset: Number(query.get("offset")),
      limit: 30,
      order: [["createdAt", "desc"]],
    });

    // convert the news to readable format
    const _news = [];
    for (const n of news) {
      const newsData = {
        ...n.get({ plain: true }),
        image: n.images[0], // set only one news for frontend
      };
      delete newsData.images;
      _news.push(newsData);
    }

    res.ok("News", { news: _news });
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

  let news = [];
  if (!body.fieldNotArray("news")) {
    // when the news field is given and is array
    for (const n of body.get("news")) {
      const newsData = new ReqBody(n, NEWS_FIELDS);

      const image = newsData.get("image");
      if (typeof image === "string") newsData.set("images", [image]);
      newsData.del("image");

      if (newsData.fieldNotArray("images")) return res.bad("No image given");

      if (newsData.anyFieldNull("title description images newsUrl"))
        return res.noParams();

      newsData.set("handle", handle.create(newsData.get("title")));

      news.push(newsData.values);
    }
  } else {
    // if only one news given then put it also in the news array
    const image = body.get("image");
    if (body.isString("image")) body.set("images", [image]);

    if (body.fieldNotArray("images")) return res.bad("No image given");

    if (body.anyFieldNull("title description images newsUrl"))
      return res.noParams();

    body.set("handle", handle.create(body.get("title")));

    // remove unneccesary information
    body.del("news");
    body.del("image");

    news.push(body.values);
  }

  try {
    const createResult = await News.bulkCreate(news);

    news = news.map((instance) => {
      instance.image = instance.images[0];
      delete instance.images;
      return instance;
    });
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
  const body = new ReqBody(req.body, [...NEWS_FIELDS, "id"]);

  {
    // set to only image if an image is given
    const image = body.get("image");
    if (typeof image === "string") body.set("images", [image]);
  }

  if (body.fieldNotArray("images")) return res.bad("No image given");

  if (body.anyFieldNull("title description images id")) return res.noParams();

  try {
    const [updated] = await News.update(
      body.bulkGetMap("title description images tags category"),
      { where: { id: body.get("id") }, individualHooks: true }
    );

    if (updated !== 1) return res.bad("Invalid news id");

    const news = await News.findOne({ where: { id: body.get("id") } });
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
  const params = new ReqBody(req.params);

  if (params.isNull("handle")) return res.noParams();

  const handle = params.get("handle");
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
