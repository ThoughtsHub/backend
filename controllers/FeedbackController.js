import { Feedback_ } from "../services/FeedbackService.js";
import { serviceCodes } from "../utils/services.js";
import { logBad, logServerErr } from "../services/LogService.js";
import activity from "../services/ActivityService.js";
import { status } from "../models/Feedback.js";

class FeedbackController {
  static create = async (req, res) => {
    const { message } = req.body;
    const profileId = req?.user?.profile?.id;

    try {
      let result = await Feedback_.create(message, status.PENDING, profileId);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Feedback failed",
          `A user failed to give feedback; \nReason: ${result.code}`,
          { info: result.info, message }
        );
        return res.failure(result.code);
      }

      const feedback = result.info.feedback;

      res.ok("Reported", { feedback });

      logBad("Feedback given", "A user gave a feedback", { feedback });
      activity("Feedback", "A user gave a feedback");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default FeedbackController;
