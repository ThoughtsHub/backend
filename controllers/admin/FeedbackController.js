import { timestampsKeys } from "../../constants/timestamps.js";
import { Feedback_ } from "../../services/FeedbackService.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminFeedbackController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await Feedback_.getByOffset(
        offset,
        res.originalQuery,
        order
      );
      if (serviceResultBadHandler(result, res, "Feedback fetch failed (admin)"))
        return;

      const feedbacks = result.info.feedbacks;

      res.ok("Feedbacks", { feedbacks });

      logOk("Feedbacks fetched successfully", "Admin requested feedbacks");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static updateStatus = async (req, res) => {
    const { status, feedbackId } = req.body;

    try {
      let result = await Feedback_.update({ status }, feedbackId);
      if (
        serviceResultBadHandler(result, res, "Feedback update failed (admin)")
      )
        return;

      const feedback = result.info.feedback;

      res.ok("Feedback updated", { feedback });

      logOk(
        "Feedback updated successfully",
        "Admin updated the status of a feedback"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminFeedbackController;
