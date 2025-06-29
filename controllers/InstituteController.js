import { Institute_ } from "../services/InstituteService.js";
import { logOk, logServerErr } from "../services/LogService.js";
import { toNumber } from "../utils/number.js";
import { serviceResultBadHandler } from "../utils/services.js";

class InstituteController {
  static getAll = async (req, res) => {
    let { offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Institute_.getInstitutes(res.originalQuery, offset);
      if (serviceResultBadHandler(result, res, "Institutes fetch failed"))
        return;

      const institutes = result.info.institutes;

      res.ok("Institutes", {
        institutes,
        nextOffset:
          institutes.length < Institute_.institutesLimit
            ? null
            : institutes.length + offset,
      });

      logOk("Institutes fetched", "A user requested institutes");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static get = async (req, res) => {
    const { instituteId } = req.query;

    try {
      const result = await Institute_.getInstitute(instituteId);
      if (serviceResultBadHandler(result, res, "Institute fetch failed"))
        return;

      const institute = result.info.institute;

      res.ok("Institute", { institute });

      logOk("Institute fetched", "A user requested a particular institute");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getAllUsersOfInstitute = async (req, res) => {
    const profileId = req?.user?.profile?.id ?? null;
    let { instituteId, offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Institute_.getUsers(instituteId, offset, profileId);
      if (serviceResultBadHandler(result, res, "Institute users fetch failed"))
        return;

      const users = result.info.users;

      res.ok("Institute users", {
        users,
        newOffset: users.length < Institute_.usersLimit ? null : users.length,
      });

      logOk(
        "Institute users fetched",
        "A user requested a particular institute's users"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static review = async (req, res) => {
    const profileId = req?.user?.profile?.id;
    const { instituteId, rating, review } = req.body;

    try {
      const result = await Institute_.writeReview(
        instituteId,
        profileId,
        review,
        rating
      );
      if (serviceResultBadHandler(result, res, "Institute review failed"))
        return;

      res.ok("Reviewed", { review: result.info.review });

      logOk("Insitute reviewed", "A user reviewed an institute", {
        instituteId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static discuss = async (req, res) => {
    const profileId = req?.user?.profile?.id;
    const { instituteId, discussionId, body } = req.body;

    try {
      const result = await Institute_.discuss(
        instituteId,
        profileId,
        discussionId,
        body
      );
      if (serviceResultBadHandler(result, res, "Institute discussion failed"))
        return;

      res.ok("Discussion written", { discussion: result.info.discussion });

      logOk("Discussion written", "A user discussed about an institute", {
        instituteId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getReviews = async (req, res) => {
    let { instituteId, offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Institute_.getReviews(instituteId, offset);
      if (serviceResultBadHandler(result, res, "Reviews fetch failed")) return;

      let reviews = result.info.reviews;

      res.ok("Reviews", {
        reviews,
        newOffset:
          reviews.length >= Institute_.reviewsLimit ? reviews.length : null,
      });

      logOk("Reviews fetched", "A user requested reviews about an instiute");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getDiscs = async (req, res) => {
    let { instituteId, offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Institute_.getDiscussions(instituteId, null, offset);
      if (serviceResultBadHandler(result, res, "Discussions fetch failed"))
        return;

      let discussions = result.info.discussions;

      res.ok("Discussions", {
        discussions,
        newOffset:
          discussions.length >= Institute_.discsLimit
            ? discussions.length
            : null,
      });

      logOk(
        "Discussions fetched",
        "A user requested discussions about an instiute"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getDiscReplies = async (req, res) => {
    let { instituteId, discussionId, offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Institute_.getDiscussions(
        instituteId,
        discussionId,
        offset
      );
      if (
        serviceResultBadHandler(result, res, "Discussion replies fetch failed")
      )
        return;

      let discussions = result.info.discussions;

      res.ok("Discussion replies", {
        discussions,
        newOffset:
          discussions.length >= Institute_.discsLimit
            ? discussions.length
            : null,
      });

      logOk(
        "Discussion replies fetched",
        "A user requested discussion replies about an instiute"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default InstituteController;
