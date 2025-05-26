import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { hash, compare } from "../utils/hash.js";
import db from "../db/pg.js";
import { timestampsKeys } from "../constants/timestamps.js";

class UserService {
  // User service response codes
  static codes = {
    BAD_USERNAME: [
      "Bad Username",
      "User doesn't exist with this username/email",
    ],
    BAD_EMAIL: ["Bad Email", "User doesn't exist with this email/username"],
    BAD_PASS: [
      "Bad Password",
      "Invalid password, should at least be of 8 letters",
    ],
    INVALID_EMAIL: [
      "Invalid Email",
      "User doesn't exist with this email/username",
    ],
    INVALID_USERNAME: [
      "Invalid Username",
      "User doesn't exist with this username/email",
    ],
    INCORRECT_PASS: ["Incorrect Password", "Incorrect password"],
  };

  static usersLimit = 30;

  static create = async (email, password) => {
    // validate email
    if (!Validate.email(email)) return sRes(this.codes.BAD_EMAIL, { email });

    // validate password
    if (!Validate.password(password))
      return sRes(this.codes.BAD_PASS, { password });

    password = hash(password);

    try {
      // create user
      let user = await User.create({ email, password });
      user = user.get({ plain: true });

      return sRes(serviceCodes.OK, { user });
    } catch (err) {
      // if err occurred
      return sRes(serviceCodes.DB_ERR, { email, password }, err);
    }
  };

  static updatePassword = async (password, userId) => {
    // if (!Validate.password(password))
    //   return sRes(this.codes.BAD_PASS, { password });

    if (!Validate.id(userId)) return sRes(serviceCodes.BAD_ID, { userId });

    password = hash(password);

    const t = await db.transaction();
    try {
      const [updateResult] = await User.update(
        { password },
        { where: { id: userId }, individualHooks: true, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.INVALID_ID, userId);
      }

      let user = await User.findByPk(userId, { transaction: t });
      user = user.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { user });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { userId, password }, err);
    }
  };

  static getByEmailAndPassword = async (email, password) => {
    if (!Validate.email(email)) return sRes(this.codes.BAD_EMAIL, { email });

    try {
      let user = await User.findOne({ where: { email } });
      if (user === null) return sRes(this.codes.INVALID_EMAIL, { email });

      if (!compare(password, user.password))
        return sRes(this.codes.INCORRECT_PASS, { password });

      user = user.get({ plain: true });

      return sRes(serviceCodes.OK, { user });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { email, password }, err);
    }
  };

  static getByUsernameAndPassword = async (username, password) => {
    if (!Validate.username(username))
      return sRes(this.codes.BAD_USERNAME, { username });

    try {
      let profile = await Profile.findOne({ where: { username } });
      if (profile === null)
        return sRes(this.codes.INVALID_USERNAME, { username });

      let user = await User.findByPk(profile.userId);

      if (!compare(password, user.password))
        return sRes(this.codes.INCORRECT_PASS, { password });

      user = user.get({ plain: true });

      return sRes(serviceCodes.OK, { user });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { username, password }, err);
    }
  };

  static delete = async (userId) => {
    if (!Validate.id(userId)) return sRes(serviceCodes.BAD_ID, { userId });

    const t = await db.transaction();
    try {
      const destroyResult = await User.destroy({
        where: { id: userId },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.INVALID_ID, { userId });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { userId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { userId }, err);
    }
  };

  static getByOffset = async (
    offset,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    const whereUserObj = {};
    const whereProfileObj = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "userId":
          if (Validate.id(val)) whereUserObj.id = val;
          break;

        case "email":
          if (Validate.email(val))
            whereUserObj.email = { [Op.iLike]: `%${val}%` };
          break;

        case "mobile":
          if (Validate.mobile(val))
            whereUserObj.mobile = { [Op.iLike]: `%${val}%` };
          break;

        case "profileId":
          if (Validate.id(val)) whereProfileObj.id = val;
          break;

        case "fullName":
          if (Validate.fullName(val))
            whereProfileObj.fullName = { [Op.iLike]: `%${val}%` };
          break;

        case "about":
          if (Validate.about(val))
            whereProfileObj.about = { [Op.iLike]: `%${val}%` };
          break;

        case "gender":
          if (Validate.gender(val)) whereProfileObj.gender = val;
          break;

        case "dob":
          if (Validate.dob(val)) whereProfileObj.dob = val;
          break;

        case "profileImageUrl":
          if (Validate.profileImageUrl(val))
            whereProfileObj.profileImageUrl = val;
          break;
      }
    }

    try {
      let users = await Profile.findAll({
        where: { ...whereProfileObj },
        offset,
        limit: this.usersLimit,
        order: orderFields,
        attributes: { include: [["id", "profileId"]], exclude: ["id"] },
        include: {
          model: User,
          as: "user",
          where: { ...whereUserObj },
          attributes: {
            include: [["id", "userId"]],
            exclude: ["id", "password"],
          },
        },
      });

      users = users.map((u) => {
        u = u.get({ plain: true });
        u = Object.assign(u, u.user);
        delete u.user;
        return u;
      });

      return sRes(serviceCodes.OK, { users });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };
}

export const User_ = UserService;
