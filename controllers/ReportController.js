import { priority, status } from "../models/Report_Forum.js";
import { Report } from "../services/ReportService.js";
import { logBad, logServerErr } from "../services/LogService.js";
import activity from "../services/ActivityService.js";
import { serviceResultBadHandler } from "../utils/services.js";

class ReportController {
  static create = async (req, res) => {
    const { postId: forumId, reason } = req.body;
    const profileId = req.user.profile.id;

    try {
      let result = await Report.Forum_.create(
        reason,
        priority.Medium,
        status.Pending,
        forumId,
        profileId
      );

      if (serviceResultBadHandler(result, res, "Report on forum failed"))
        return;

      const report = result.info.report;

      res.ok("Reported", { report });

      logBad("Reported forum", "A user reported a forum", { report });
      activity("Forum report", "A user reported a forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default ReportController;
