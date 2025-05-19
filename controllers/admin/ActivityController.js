import { Activity_ } from "../../services/ActivityService.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminActivityController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);

    try {
      let result = await Activity_.getByOffset(offset);
      if (serviceResultBadHandler(result, res, "Activity fetch failed")) return;

      const activities = result.info.activities;

      res.ok("Activity", { activities });

      logOk("Activity fetched", "Admin requested activities");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminActivityController;
