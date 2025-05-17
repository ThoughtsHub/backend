import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { hash, compare } from "../utils/hash.js";
import db from "../db/pg.js";

class UserService {
  static create = async (email, password) => {
    // validate email
    if (!Validate.email(email)) return sRes(codes.BAD_EMAIL, { email });

    // validate password
    if (!Validate.password(password)) return sRes(codes.BAD_PASS, { password });

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
    if (!Validate.password(password)) return sRes(codes.BAD_PASS, { password });

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
    if (!Validate.email(email)) return sRes(codes.BAD_EMAIL, { email });

    if (!Validate.password(password)) return sRes(codes.BAD_PASS, { password });

    try {
      let user = await User.findOne({ where: { email } });
      if (user === null) return sRes(codes.INVALID_EMAIL, { email });

      if (!compare(password, user.password))
        return sRes(codes.INCORRECT_PASS, { password });

      user = user.get({ plain: true });

      return sRes(serviceCodes.OK, { user });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { email, password }, err);
    }
  };

  static getByUsernameAndPassword = async (username, password) => {
    if (!Validate.username(username))
      return sRes(codes.BAD_USERNAME, { username });

    if (!Validate.password(password)) return sRes(codes.BAD_PASS, { password });

    try {
      let profile = await Profile.findOne({ where: { username } });
      if (profile === null) return sRes(codes.INVALID_USERNAME, { username });

      let user = await User.findByPk(profile.userId);

      if (!compare(password, user.password))
        return sRes(codes.INCORRECT_PASS, { password });

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
}

// User service response codes
export const codes = {
  BAD_USERNAME: "Bad Username",
  BAD_EMAIL: "Bad Email",
  BAD_PASS: "Bad Password",
  INVALID_EMAIL: "Invalid Email",
  INVALID_USERNAME: "Invalid Username",
  INCORRECT_PASS: "Incorrect Password",
};

export const User_ = UserService;
