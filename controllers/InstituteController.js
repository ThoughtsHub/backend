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
}

export default InstituteController;
