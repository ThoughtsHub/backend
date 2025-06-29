import {
  includeProfile,
  includeProfileNOTAs,
  includeWriterWith,
} from "../constants/include.js";
import db from "../db/pg.js";
import Follower from "../models/Follower.js";
import Profile from "../models/Profile.js";
import { serviceCodes, sRes } from "../utils/services.js";
import sendNotification from "./NotificationService.js";

class FollowerService {
  // Follower service response codes
  static codes = {
    ALREADY_FOLLOWING: [
      "Already Following",
      "You are already following this user",
    ],
    NEVER_FOLLOWED: ["Never Followed", "You never followed this user"],
    SAME_ID: ["Same Id", "You cannot (un/)follow yourself"],
  };

  static followersLimit = 30;

  static follow = async (from, to) => {
    const t = await db.transaction();
    if (from === to) {
      await t.rollback();
      return sRes(this.codes.SAME_ID);
    }

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

      const profile = await Profile.findOne({ where: { id: from } });
      sendNotification({
        type: "PROFILEID",
        id: to,
        data: {
          title: `@${profile.username} started following you.`,
        },
      });

      return sRes(serviceCodes.OK);
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { from, to }, err);
    }
  };

  static unfollow = async (from, to) => {
    const t = await db.transaction();
    if (from === to) {
      await t.rollback();
      return sRes(this.codes.SAME_ID);
    }

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

  static getFollowers = async (id, offset = 0, profileId = null) => {
    try {
      let followers = await Follower.findAll({
        where: { profileId: id },
        limit: this.followersLimit,
        offset,
        include: [null, undefined].includes(profileId)
          ? [includeProfileNOTAs]
          : [includeWriterWith(profileId, true)],
      });
      followers = followers.map((f) => {
        f = f.get({ plain: true });
        f.profile = f.Profile;
        f.profile.isFollowing =
          Array.isArray(f.profile.follow) && f.profile.follow.length === 1;
        delete f.profile.follow;
        delete f.Profile;
        return f.profile;
      });

      return sRes(serviceCodes.OK, { followers });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { id, offset }, err);
    }
  };

  static getFollowing = async (id, offset = 0, profileId = null) => {
    try {
      let followings = await Follower.findAll({
        where: { followerId: id },
        limit: this.followersLimit,
        offset,
        include: [null, undefined].includes(profileId)
          ? [
              {
                model: Profile,
                as: "followedProfile",
                attributes: { include: [["id", "profileId"]], exclude: ["id"] },
              },
            ]
          : [
              {
                model: Profile,
                as: "followedProfile",
                attributes: { include: [["id", "profileId"]], exclude: ["id"] },
                include: [
                  {
                    model: Follower,
                    required: false,
                    where: { followerId: profileId },
                    as: "follow",
                  },
                ],
              },
            ],
      });
      followings = followings.map((f) => {
        f = f.get({ plain: true });
        f.profile = f.followedProfile;
        f.profile.isFollowing =
          Array.isArray(f.profile.follow) && f.profile.follow.length === 1;
        delete f.profile.follow;
        delete f.followedProfile;
        return f.profile;
      });

      return sRes(serviceCodes.OK, { followings });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { id, offset }, err);
    }
  };
}

export const Follower_ = FollowerService;
