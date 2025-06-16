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
    const { aisheCode } = req.query;

    try {
      const result = await Institute_.getInstitute(aisheCode);
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
}

export default InstituteController;
