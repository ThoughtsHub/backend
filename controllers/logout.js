import { client } from "../db/connect.js";
import cookie from "../constants/cookies.js";

const logoutHandler = async (req, res) => {
  try {
    await client.del(req.sessionId); // remove from db
    res.clearCookie(cookie.sessionId); // remove cookies

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const handler = {
  logout: logoutHandler,
};

export default handler;
