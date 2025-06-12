import { includeProfile, includeProfileNOTAs } from "../constants/include.js";
import db from "../db/pg.js";
import Follower from "../models/Follower.js";
import Profile from "../models/Profile.js";
import { serviceCodes, sRes } from "../utils/services.js";

class FollowerService {
  // Follower service response codes
  static codes = {
    ALREADY_FOLLOWING: [
      "Already Following",
      "You are already following this user",
    ],
    NEVER_FOLLOWED: ["Never Followed", "You never followed this user"],
  };

  static followersLimit = 30;

  static follow = async (from, to) => {
    const t = await db.transaction();

    try {
      let follower = await Follower.findOne({
        where: { profileId: to, followerId: from },
        transaction: t,
      });
      if (follower !== null) {
        await t.rollback();
        return sRes(this.codes.ALREADY_FOLLOWING, { from, to });
      }

      follower = await Follower.create({
        profileId: to,
        followerId: from,
      });

      let [[_1, updateResult1]] = await Profile.increment(
        { followers: 1 },
        { where: { id: to }, transaction: t }
      );
      let [[_2, updateResult2]] = await Profile.increment(
        { following: 1 },
        { where: { id: from }, transaction: t }
      );

      if (updateResult1 !== 1 && updateResult2 !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { from, to });
      }

      await t.commit();
      return sRes(serviceCodes.OK);
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { from, to }, err);
    }
  };

  static unfollow = async (from, to) => {
    const t = await db.transaction();

    try {
      let follower = await Follower.findOne({
        where: { profileId: to, followerId: from },
        transaction: t,
      });
      if (follower === null) {
        await t.rollback();
        return sRes(this.codes.ALREADY_FOLLOWING, { from, to });
      }

      const deleteResult = await Follower.destroy({
        where: { profileId: to, followerId: from },
        transaction: t,
        individualHooks: true,
      });

      if (deleteResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { from, to });
      }

      let [[_1, updateResult1]] = await Profile.decrement(
        { followers: 1 },
        { where: { id: to }, transaction: t }
      );
      let [[_2, updateResult2]] = await Profile.decrement(
        { following: 1 },
        { where: { id: from }, transaction: t }
      );

      if (updateResult1 !== 1 && updateResult2 !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { from, to });
      }

      await t.commit();
      return sRes(serviceCodes.OK);
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { from, to }, err);
    }
  };

  static get = async (id, offset = 0) => {
    try {
      let followers = await Follower.findAll({
        where: { profileId: id },
        limit: this.followersLimit,
        offset,
        include: [includeProfileNOTAs],
      });
      followers = followers.map((f) => {
        f = f.get({ plain: true });
        f.profile = f.Profile;
        delete f.Profile;

        return f;
      });

      return sRes(serviceCodes.OK, { followers });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { id, offset }, err);
    }
  };
}

export const Follower_ = FollowerService;
