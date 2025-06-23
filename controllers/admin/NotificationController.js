import { logBad, logOk, logServerErr } from "../../services/LogService.js";
import { Notification_ } from "../../services/NotificationService.js";
import { isString } from "../../utils/checks.js";

class NotificationController {
  static send = async (req, res) => {
    const { title, body, tokens = [], toExclude = true } = req.body;

    if (!isString(title) || !isString(body)) {
      logBad(
        "Notification send failed",
        "Admin published an outlier notification"
      );
      return res.failure("Notification title and body must be strings");
    }
    if (!Array.isArray(tokens)) {
      logBad(
        "Notification send failed",
        "Admin published an outlier notification"
      );
      return res.failure("Tokens have to be an array");
    }

    try {
      if (tokens.length === 0)
        Notification_.sendToAll({ data: { title, body } });
      else if (toExclude === true)
        Notification_.bulkSendE({ tokens, data: { title, body } });
      else Notification_.bulkSend({ tokens, data: { title, body } });

      res.ok("Notification sent");

      logOk("Notification sent", "Admin published an outlier notification");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default NotificationController;
