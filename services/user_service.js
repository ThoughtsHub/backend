import User from "../models/User.js";
import { parseFields } from "../utils/field_parser.js";
import {
  idInvalidOrMissing,
  usernameValid,
  reqFieldsNotGiven,
} from "../utils/service_checks.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import Profile from "../models/Profile.js";
import { usersLimitPerPage } from "../constants/pagination.js";
import db from "../db/pg.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { UpgradedBody } from "../middlewares/body.js";
import { usernameCheck } from "../utils/field_checks.js";

const modelFields = "username email mobile password*";
const { fields, reqFields } = parseFields(modelFields);

const profileModelFields =
  "username* fullName* about* profileImageUrl gender dob";
const { fields: profileFields, reqFields: profileReqFields } =
  parseFields(profileModelFields);

class UserService {
  static updateUsernameByID = async (
    id,
    username,
    options = { transaction }
  ) => {
    let idCheck = idInvalidOrMissing(id, "User");
    if (idCheck !== false) return idCheck;

    try {
      const checkedUsername = usernameCheck(username);
      if (checkedUsername === false)
        return sResult(
          SERVICE_CODE.PROPERTY_TYPE_INVALID,
          "Invalid username format"
        );

      const usernameAvailable = await usernameValid(checkedUsername, id);

      if (!usernameAvailable) {
        return sResult(
          SERVICE_CODE.USERNAME_UNAVAILABLE,
          "Username is not available, or is not valid."
        );
      }

      const [updateResult] = await User.update(
        { username },
        {
          where: { id },
          transaction: options.transaction ?? null,
          individualHooks: true,
        }
      );

      if (updateResult !== 1)
        return sResult(SERVICE_CODE.ID_INVALID, "User Id Invalid");

      return true;
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static get = async (body) => {
    const offset = body.toNumber("offset");

    try {
      let users = await Profile.findAll({
        offset: offset * usersLimitPerPage,
        limit: usersLimitPerPage,
        order: [[timestampsKeys.updatedAt, "DESC"]],
      });
      users = users.map((u) => {
        u = u.get({ plain: true });
        u.profileId = u.id;
        delete u.id;
        return u;
      });

      return sResult(SERVICE_CODE.ACQUIRED, { users });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getWAdminRights = async (body) => {
    const offset = body.toNumber("offset");

    try {
      let users = await User.findAll({
        where: {},
        offset: offset * usersLimitPerPage,
        limit: usersLimitPerPage,
        order: [[timestampsKeys.updatedAt, "DESC"]],
        include: [{ model: Profile }],
      });
      users = users.map((u) => u.get({ plain: true }));

      return sResult(SERVICE_CODE.ACQUIRED, { users });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static countAll = async () => {
    try {
      const usersCount = await User.count();

      return sResult(SERVICE_CODE.ACQUIRED, usersCount);
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static createNewWAdminRights = async (body) => {
    const userBody = new UpgradedBody(body.data, fields),
      profileBody = new UpgradedBody(body.data, profileFields);

    let reqFieldsCheck = reqFieldsNotGiven(userBody, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;
    reqFieldsCheck = reqFieldsNotGiven(profileBody, profileReqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      let user = await User.create(userBody.data, { transaction: t });
      let profile = await Profile.create(
        { ...profileBody.data, userId: user.id },
        { transaction: t }
      );
      profile = profile.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { user, profile });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExistingWAdminRights = async (body) => {
    const id = body.get("userId");

    let idCheck = idInvalidOrMissing(id, "User");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      const destroyResult = await User.destroy({
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "User Id invalid");
      }

      await t.commit();
      return sResult(SERVICE_CODE.DELETED);
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default UserService;
