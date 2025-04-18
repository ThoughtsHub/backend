import { forumsLimitPerPage } from "../constants/pagination.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter } from "../constants/writer.js";
import db from "../db/pg.js";
import Forum from "../models/Forums.js";
import ForumVote from "../models/ForumVote.js";
import Profile from "../models/Profile.js";
import { parseFields } from "../utils/field_parser.js";
import {
  idInvalidOrMissing,
  reqFieldsNotGiven,
} from "../utils/service_checks.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import UserService from "./user_service.js";

const modelFields = "username* fullName* about* profileImageUrl gender dob";
const { fields, reqFields } = parseFields(modelFields);

class ProfileService {
  static profileExistsByUserID = async (userId) => {
    const profile = await Profile.findOne({ where: userId });
    return profile !== null;
  };

  static profileBelongsToUserByUserID = async (profileId, userId) => {
    const profile = await Profile.findOne({ where: { id: profileId, userId } });
    return profile !== null;
  };

  static createNew = async (body) => {
    const userId = body.get("userId");
    const username = body.get("username");

    body.setFields(fields);

    let idCheck = idInvalidOrMissing(userId, "User");
    if (idCheck !== false) return idCheck;

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      const profileExistsAlready = await this.profileExistsByUserID(userId);
      if (profileExistsAlready) {
        await t.rollback();
        return sResult(
          SERVICE_CODE.PROFILE_ALREADY_EXISTS,
          "Profile was already created, if you want to update, use PUT /profile"
        );
      }

      const usernameUpdatedInUser = await UserService.updateUsernameByID(
        userId,
        username,
        { transaction: t }
      );

      if (usernameUpdatedInUser !== true) {
        await t.rollback();
        return usernameUpdatedInUser;
      }

      let profile = await Profile.create(body.data, {
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
        transaction: t,
      });
      profile = profile.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { user: profile });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingFull = async (body, wAdminRights = false) => {
    const userId = body.get("userId");
    const id = body.get("profileId");
    const username = body.get("username");

    body.setFields(fields);

    let idCheck = idInvalidOrMissing(userId, "User");
    if (idCheck !== false) return idCheck;
    if (!wAdminRights) {
      idCheck = idInvalidOrMissing(id, "Profile");
      if (idCheck !== false) return idCheck;

      let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
      if (reqFieldsCheck !== false) return reqFieldsCheck;
    }

    const t = await db.transaction();
    try {
      if (!wAdminRights) {
        const profileBelongs = await this.profileBelongsToUserByUserID(
          id,
          userId
        );
        if (!profileBelongs) {
          await t.rollback();
          return sResult(SERVICE_CODE.ID_INVALID, "Invalid user Id");
        }
      }

      if (username !== null) {
        const usernameUpdatedInUser = await UserService.updateUsernameByID(
          userId,
          username,
          { transaction: t }
        );

        if (usernameUpdatedInUser !== true) {
          await t.rollback();
          return usernameUpdatedInUser;
        }
      }
      body.removeNulDefined();

      let [updateResult] = await Profile.update(body.data, {
        where: { userId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid user Id");
      }

      let profile = await Profile.findOne({
        where: { userId },
        transaction: t,
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
      });
      profile = profile.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { user: profile });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingPartial = async (body) => {
    const userId = body.get("userId");
    const id = body.get("profileId");
    const username = body.get("username");

    body.removeNulDefined();

    let idCheck = idInvalidOrMissing(userId, "User");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(id, "Profile");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      const profileBelongs = await this.profileBelongsToUserByUserID(
        id,
        userId
      );
      if (!profileBelongs) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid user Id");
      }

      if (username !== null) {
        const usernameUpdatedInUser = await UserService.updateUsernameByID(
          userId,
          username,
          { transaction: t }
        );

        if (usernameUpdatedInUser !== true) {
          await t.rollback();
          return usernameUpdatedInUser;
        }
      }

      let [updateResult] = await Profile.update(body.data, {
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid user Id");
      }

      let profile = await Profile.findByPk(id, {
        transaction: t,
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
      });
      profile = profile.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { user: profile });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByID = async (body) => {
    const id = body.get("profileId");

    let idCheck = idInvalidOrMissing(id, "Profile");
    if (idCheck !== false) return idCheck;

    try {
      // TODO: hide things that user wants to not show
      let profile = await Profile.findByPk(id, {
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
      });
      profile = profile.get({ plain: true });

      return sResult(SERVICE_CODE.ACQUIRED, { profile });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByUserID = async (body) => {
    const userId = body.get("userId");

    let idCheck = idInvalidOrMissing(userId, "User");
    if (idCheck !== false) return idCheck;

    try {
      // TODO: hide things that user wants to not show
      let profile = await Profile.findOne({
        where: { userId },
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
      });
      profile = profile.get({ plain: true });

      return sResult(SERVICE_CODE.ACQUIRED, { user: profile });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getSelf = async (body) => {
    const id = body.get("profileId");

    let idCheck = idInvalidOrMissing(id, "Profile");
    if (idCheck !== false) return idCheck;

    try {
      let profile = await Profile.findByPk(id, {
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
      });
      profile = profile.get({ plain: true });

      return sResult(SERVICE_CODE.ACQUIRED, { profile });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getForumsByID = async (body) => {
    const profileId = body.get("profileId");
    const offset = body.toNumber("offset");

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;

    try {
      let forums = await Forum.findAll({
        where: { profileId },
        offset,
        limit: forumsLimitPerPage,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [
          includeWriter,
          {
            model: ForumVote,
            required: false,
            where: { profileId, value: 1 },
          },
        ],
      });

      forums = forums.map((f) => {
        f = f.get({ plain: true });
        if (Array.isArray(f.ForumVotes) && f.ForumVotes.length === 1)
          f.isVoted = true;
        else f.isVoted = false;
        delete f.ForumVotes;
        return f;
      });

      return sResult(SERVICE_CODE.ACQUIRED, {
        forums,
        nextOffset: forums.length + offset,
        endOfUserForums: forums.length < forumsLimitPerPage,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default ProfileService;
