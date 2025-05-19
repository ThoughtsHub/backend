import { timestampsKeys } from "../../constants/timestamps.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { Report } from "../../services/ReportService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminReportForumController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await Report.Forum_.getByOffset(
        offset,
        res.originalQuery,
        order
      );
      if (serviceResultBadHandler(result, res, "Report fetch failed (admin)"))
        return;

      const reports = result.info.reports;

      res.ok("Reports", { reports });

      logOk("Reports fetched successfully", "Admin requested reports");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static updateStatusAndPriority = async (req, res) => {
    const { status, priority, reportId } = req.body;

    try {
      let result = await Report.Forum_.update({ status, priority }, reportId);
      if (serviceResultBadHandler(result, res, "Report update failed (admin)"))
        return;

      const report = result.info.report;

      res.ok("Report updated", { report });

      logOk(
        "Report updated successfully",
        "Admin updated the status/priority of a report"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

const AdminReportController = {
  Forum_: AdminReportForumController,
};

export default AdminReportController;
