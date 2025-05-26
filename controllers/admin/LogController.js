import { Log_, logOk, logServerErr } from "../../services/LogService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminLogController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);

    try {
      let result = await Log_.getByOffset(offset);
      if (serviceResultBadHandler(result, res, "Logs fetch failed")) return;

      const logs = result.info.logs;

      res.ok("Logs", { logs });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminLogController;
