import db from "../db/pg.js";
import Profile from "../models/Profile.js";
import Forum from "../models/Forum.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import { timestampsKeys } from "../constants/timestamps.js";
import {
  includeAppreciation,
  includeFollower,
  includeWriter,
  includeWriterWith,
} from "../constants/include.js";
import { createReferralCode } from "../utils/refer.js";
import User from "../models/User.js";
import WalletActivity from "../models/WalletActivity.js";

class ProfileService {
  // Profile service response codes
  static codes = {
    BAD_FULLNAME: [
      "Bad Fullname",
      "Full name should at least contain 3 letters",
    ],
    BAD_ABOUT: ["Bad About", "Invalid about"],
    BAD_GENDER: ["Bad Gender", `Gender can only be Male, Female or Other`],
    BAD_USERNAME: [
      "Bad Username",
      "Invalid username, username cannot contain special characters and should at least contain 3 letters",
    ],
    BAD_PFP: ["Bad ProfileImageUrl", "Invalid url"],
    BAD_DOB: [
      "Bad Date of Birth",
      "Current age should be in between 15-80 years old",
    ],
  };

  static forumsLimit = 30;
  static usersLimit = 30;

  static create = async (
    fullName,
    about,
    gender,
    profileImageUrl = "",
    dob,
    username,
    userId
  ) => {
    if (!Validate.fullName(fullName))
      return sRes(this.codes.BAD_FULLNAME, { fullName });

    if (!Validate.about(about)) return sRes(this.codes.BAD_ABOUT, { about });

    if (!Validate.gender(gender))
      return sRes(this.codes.BAD_GENDER, { gender });

    if (!Validate.profileImageUrl(profileImageUrl))
      return sRes(this.codes.BAD_PFP, { profileImageUrl });

    if (!Validate.dob(dob)) return sRes(this.codes.BAD_DOB, { dob });

    if (!Validate.username(username))
      return sRes(this.codes.BAD_USERNAME, { username });

    if (!Validate.id(userId)) return sRes(serviceCodes.BAD_ID, { userId });

    const t = await db.transaction();
    try {
      const referCode = createReferralCode(username);
      let profile = await Profile.create(
        {
          fullName,
          about,
          gender,
          dob,
          profileImageUrl,
          username,
          userId,
          referralCode: referCode,
        },
        { transaction: t }
      );
      profile = profile.get({ plain: true });

      let user = await User.findByPk(userId, { transaction: t });
      let referProfile = await Profile.findOne({ where: { userId: user.id } });
      if (user.referredFrom !== null) {
        let ops = await this.addToWallet(
          profile.id,
          50,
          "User created through referral code",
          t
        );
        if (!ops) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, {
            fullName,
            about,
            gender,
            dob,
            profileImageUrl,
            username,
            userId,
          });
        }
        ops = await this.addToWallet(
          referProfile.id,
          50,
          "User created from YOUR referral code",
          t
        );
        if (!ops) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, {
            fullName,
            about,
            gender,
            dob,
            profileImageUrl,
            username,
            userId,
          });
        }
      }

      await t.commit();

      return sRes(serviceCodes.OK, { profile });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        { fullName, about, gender, dob, profileImageUrl, username, userId },
        err
      );
    }
  };

  static update = async (values, profileId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "fullName":
          if (Validate.fullName(val)) valuesToBeUpdated.fullName = val;
          break;

        case "about":
          if (Validate.about(val)) valuesToBeUpdated.about = val;
          break;

        case "gender":
          if (Validate.gender(val)) valuesToBeUpdated.gender = val;
          break;

        case "dob":
          if (Validate.dob(val)) valuesToBeUpdated.dob = val;
          break;

        case "profileImageUrl":
          if (Validate.profileImageUrl(val))
            valuesToBeUpdated.profileImageUrl = val;
          break;

        case "username":
          if (Validate.username(val)) valuesToBeUpdated.username = val;
          break;
      }
    }

    const t = await db.transaction();
    try {
      const [updateResult] = await Profile.update(valuesToBeUpdated, {
        where: { id: profileId },
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { values, profileId });
      }

      let profile = await Profile.findByPk(profileId);
      profile = profile.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { profile });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, profileId }, err);
    }
  };

  static usernameAvailable = async (username) => {
    if (!Validate.username(username))
      return sRes(this.codes.BAD_USERNAME, { username });

    try {
      const user = await Profile.findOne({ where: { username } });
      const available = user === null;

      return sRes(serviceCodes.OK, available);
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { username }, err);
    }
  };

  static getById = async (profileId, requesterProfileId = null) => {
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    try {
      let profile = await Profile.findByPk(profileId, {
        include: [null, undefined].includes(requesterProfileId)
          ? []
          : [includeFollower(requesterProfileId)],
      });

      if (profile !== null) {
        profile = profile.get({ plain: true });
        profile.profileId = profile.id;
        profile.isFollowing =
          Array.isArray(profile.follow) && profile.follow.length === 1;
        delete profile.follow;
        delete profile.id;
      }

      return sRes(serviceCodes.OK, { profile });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { profileId }, err);
    }
  };

  static getByUserId = async (userId) => {
    if (!Validate.id(userId)) return sRes(serviceCodes.BAD_ID, { userId });

    try {
      let profile = await Profile.findOne({ where: { userId } });
      profile = profile?.get({ plain: true });

      return sRes(serviceCodes.OK, { profile });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { profileId }, err);
    }
  };

  static getForums = async (profileId, requesterProfileId, offset) => {
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    if (
      !Validate.id(requesterProfileId) &&
      ![null, undefined].includes(requesterProfileId)
    )
      return sRes(serviceCodes.BAD_ID, { requesterProfileId });

    try {
      let forums = await Forum.findAll({
        where: { profileId },
        offset,
        limit: this.forumsLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [null, undefined].includes(requesterProfileId)
          ? [includeWriter]
          : [
              includeAppreciation(requesterProfileId),
              includeWriterWith(requesterProfileId, false, "writer"),
            ],
      });
      forums = forums.map((f) => {
        f = f.get({ plain: true });
        f.isVoted =
          Array.isArray(f.appreciations_) && f.appreciations_.length === 1;
        f.writer.isFollowing =
          Array.isArray(f.writer.follow) && f.writer.follow.length === 1;
        delete f.writer.follow;
        delete f.appreciations_;
        return f;
      });

      return sRes(serviceCodes.OK, { forums });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        { profileId, requesterProfileId, offset },
        err
      );
    }
  };

  static getAll = async (offset, profileId = null) => {
    try {
      let users = await Profile.findAll({
        // where: { [Op.not]: { username: "admin" } }, // should not list admins in the users list
        offset,
        limit: this.usersLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [includeFollower(profileId)],
      });

      users = users.map((u) => {
        u = u.get({ plain: true });
        u.profileId = u.id;
        u.isFollowing = Array.isArray(u.follow) && u.follow.length === 1;
        delete u.follow;
        delete u.id;
        return u;
      });

      return sRes(serviceCodes.OK, { users });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset }, err);
    }
  };

  static addToWallet = async (
    profileId,
    value,
    description,
    transaction = undefined
  ) => {
    try {
      await WalletActivity.create(
        { profileId, value, type: "INCOME", description },
        { transaction }
      );

      let [[_, updateResult]] = await Profile.increment(
        { wallet: value },
        { where: { id: profileId }, transaction }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  };
}

export const Profile_ = ProfileService;
