import { Op } from "sequelize";
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

  static getAllAvailableFCMTokens = async () => {
    let users = await User.findAll({
      where: { fcmToken: { [Op.not]: null } },
      attributes: ["fcmToken"],
    });
    const fcmTokens = users.map((u) => u.fcmToken);
    return fcmTokens;
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
      android: { priority: "HIGH" },
    };

    try {
      const response = await firebase.messaging().send(message);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   *
   * @param {{tokens: string[], data: {title: string, body: string}}}} param0
   * @returns {Promise<string[]>}
   */
  static bulkSend = async ({ tokens, data }) => {
    const registrationTokens = tokens;
    const message = {
      tokens: registrationTokens,
      notification: {
        title: data.title,
        body: data.body,
      },
    };

    try {
      const response = await firebase.messaging().sendEachForMulticast(message);
      const failures = response.responses
        .map((r, i) => [registrationTokens[i], r.success])
        .filter((r) => !r[1])
        .map((r) => r[0]);

      return failures;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  /**
   *
   * @param {{tokens: string[], data: {title: string, body: string}}} param0
   * @returns
   */
  static bulkSendE = async ({ tokens, data }) => {
    let tokensA = await FCMTokenService.getAllAvailableFCMTokens();
    let tokensToSend = [];
    tokensA.forEach((t) => {
      if (!tokens.includes(t)) tokensToSend.push(t);
    });
    return this.bulkSend({ tokens: tokensToSend, data });
  };

  /**
   *
   * @param {{data: {title: string, body: string}}} param0
   */
  static sendToAll = async ({ data }) => {
    const tokens = await FCMTokenService.getAllAvailableFCMTokens();
    return this.bulkSend({ tokens, data });
  };
}

export const Notification_ = NotificationService;

const sendNotification = Notification_.send;
export default sendNotification;
