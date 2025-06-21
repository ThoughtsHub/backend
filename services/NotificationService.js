import { includeWriter } from "../constants/include.js";
import firebase from "../env/firebase/firebase.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { isString } from "../utils/checks.js";

class FCMTokenService {
  static getByUserId = async (userId) => {
    if (!isString(userId)) return null;
    const user = await User.findByPk(userId);
    if (!user) return null;

    return user.fcmToken;
  };

  static getByForumId = async (forumId) => {
    const forum = await Forum.findByPk(forumId, { include: [includeWriter] });
    if (!forum) return null;

    const userId = forum.writer.userId;
    return this.getByUserId(userId);
  };

  static getByProfileId = async (profileId) => {
    const profile = await Profile.findByPk(profileId);
    if (!profile) return null;

    const userId = profile.userId;
    return this.getByUserId(userId);
  };
}

class NotificationService {
  /**
   *
   * @param {{type: "FORUMID" | "USERID" | "PROFILEID", id: string | null, data: {title: string, body: string}}} param0
   * @returns
   */
  static send = async ({ type, id, data }) => {
    let fcmToken = null;
    if (type === "FORUMID") fcmToken = await FCMTokenService.getByForumId(id);
    else if (type === "USERID")
      fcmToken = await FCMTokenService.getByUserId(id);
    else if (type === "PROFILEID")
      fcmToken = await FCMTokenService.getByProfileId(id);
    else return;
    if (!fcmToken) return;

    const message = {
      token: fcmToken,
      notification: {
        title: data.title,
        body: data.body,
      },
    };

    const response = await firebase.messaging().send(message);
  };
}

export const Notification_ = NotificationService;

const sendNotification = Notification_.send;
export default sendNotification;
