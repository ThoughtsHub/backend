import { Follower_ } from "../services/FollowerService.js";
import { logOk, logServerErr } from "../services/LogService.js";
import { toNumber } from "../utils/number.js";
import { serviceResultBadHandler } from "../utils/services.js";

class FollowerController {
  static follow = async (req, res) => {
    const profileId = req.user.profile.id;
    const { following } = req.body;

    try {
      const result = await Follower_.follow(profileId, following);
      if (serviceResultBadHandler(result, res, "Follow failed")) return;

      res.ok("Followed");

      logOk("Followed", "A user followed another user", {
        from: profileId,
        to: following,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static unfollow = async (req, res) => {
    const profileId = req.user.profile.id;
    const { following } = req.body;

    try {
      const result = await Follower_.unfollow(profileId, following);
      if (serviceResultBadHandler(result, res, "Unfollow failed")) return;

      res.ok("Unfollowed");

      logOk("Unfollowed", "A user Unfollowed another user", {
        from: profileId,
        to: following,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static get = async (req, res) => {
    let { profileId, offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Follower_.get(profileId, offset);
      if (serviceResultBadHandler(result, res, "Followers list fetch failed"))
        return;

      const followers = result.info.followers;

      res.ok("Followers", {
        followers,
        newOffset:
          followers.length < Follower_.followersLimit
            ? null
            : followers.length + offset,
      });

      logOk("Followers fetched", "A user requested for followers list", {
        profileId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default FollowerController;
