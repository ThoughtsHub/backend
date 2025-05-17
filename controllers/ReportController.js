import { priority, status } from "../models/Report_Forum.js";
import { Report } from "../services/ReportService.js";
import { serviceCodes } from "../utils/services.js";
import { logBad, logServerErr } from "../services/LogService.js";
import activity from "../services/ActivityService.js";

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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Report forum failed",
          `A user failed to report on a forum; \nReason: ${result.code}`,
          { info: result.info, forumId, profileId, reason }
        );
        return res.failure(result.code);
      }

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
