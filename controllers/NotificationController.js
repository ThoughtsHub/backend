import { logOk, logServerErr } from "../services/LogService.js";
import { Notification_ } from "../services/NotificationService.js";
import { toNumber } from "../utils/number.js";
import { serviceResultBadHandler } from "../utils/services.js";

class NotificationController {
  static get = async (req, res) => {
    const profileId = req?.user?.profile?.id;
    let { offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Notification_.getByOffset(profileId, offset);
      if (serviceResultBadHandler(result, res, "Notification fetch failed"))
        return;

      const notifications = result.info.notifications;

      res.ok("Notifications", {
        notifications,
        newOffset:
          notifications.length < Notification_.NotificationLimit
            ? null
            : notifications.length + offset,
      });

      logOk("Notification fetch", "A user requested its notifications", {
        profileId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default NotificationController;
