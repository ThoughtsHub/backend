import { timestampsKeys } from "../constants/timestamps.js";
import Forum from "../models/Forum.js";
import ForumComment from "../models/Forum_Comment.js";
import Notification, { variants } from "../models/Notification.js";
import Profile from "../models/Profile.js";
import { serviceCodes, sRes } from "../utils/services.js";

class NotificationService {
  static NotificationLimit = 30;

  static like = async (forumId, fromId, t = null) => {
    try {
      const forum = await Forum.findByPk(forumId, { transaction: t });
      const profile = await Profile.findByPk(forum.profileId, {
        transaction: t,
      });
      const fromProfile = await Profile.findByPk(fromId, { transaction: t });

      const message = `${fromProfile.username} liked on "${forum.title}"`;

      const notification = await Notification.create(
        {
          type: variants.LIKE,
          profileId: profile.id,
          forumId: forum.id,
          fromProfileId: fromProfile.id,
          notificationMessage: message,
        },
        { transaction: t }
      );

      return sRes(serviceCodes.OK, { forumId, fromId });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { forumId, fromId }, err);
    }
  };

  static unlike = async (forumId, fromId, t = null) => {
    try {
      const forum = await Forum.findByPk(forumId, { transaction: t });
      const profile = await Profile.findByPk(forum.profileId, {
        transaction: t,
      });
      const fromProfile = await Profile.findByPk(fromId, { transaction: t });

      const message = `${fromProfile.username} unliked on "${forum.title}"`;

      const notification = await Notification.create(
        {
          type: variants.UNLIKE,
          profileId: profile.id,
          forumId: forum.id,
          fromProfileId: fromProfile.id,
          notificationMessage: message,
        },
        { transaction: t }
      );
      return sRes(serviceCodes.OK, { forumId, fromId });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { forumId, fromId }, err);
    }
  };

  static comment = async (commentId, fromId, t = null) => {
    try {
      const comment = await ForumComment.findByPk(commentId, {
        transaction: t,
      });
      const forum = await Forum.findByPk(comment.forumId, { transaction: t });
      const profile = await Profile.findByPk(forum.profileId, {
        transaction: t,
      });
      const fromProfile = await Profile.findByPk(fromId, { transaction: t });

      const message = `${fromProfile.username} commented on "${forum.title}"`;

      const notification = await Notification.create(
        {
          type: variants.UNLIKE,
          profileId: profile.id,
          forumId: forum.id,
          commentId: comment.id,
          fromProfileId: fromProfile.id,
          notificationMessage: message,
        },
        { transaction: t }
      );

      return sRes(serviceCodes.OK, { commentId, fromId });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { commentId, fromId }, err);
    }
  };

  static getByOffset = async (profileId, offset) => {
    try {
      let notifications = await Notification.findAll({
        where: { profileId },
        limit: this.NotificationLimit,
        offset,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      notifications = notifications.map((n) => n.get({ plain: true }));

      return sRes(serviceCodes.OK, { notifications });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { profileId, offset }, err);
    }
  };
}

export const Notification_ = NotificationService;
const notify = NotificationService;
export default notify;
