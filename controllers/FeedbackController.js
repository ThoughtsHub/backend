import { Feedback_ } from "../services/FeedbackService.js";
import { logBad, logServerErr } from "../services/LogService.js";
import activity from "../services/ActivityService.js";
import { status } from "../models/Feedback.js";
import { serviceResultBadHandler } from "../utils/services.js";

class FeedbackController {
  static create = async (req, res) => {
    const { message } = req.body;
    const profileId = req?.user?.profile?.id;

    try {
      let result = await Feedback_.create(message, status.PENDING, profileId);

      if (serviceResultBadHandler(result, res, "Feedback failed")) return;

      const feedback = result.info.feedback;

      res.ok("Feedback given", { feedback });

      logBad("Feedback given", "A user gave a feedback", { feedback });
      activity("Feedback", "A user gave a feedback");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default FeedbackController;
