import activity from "../services/ActivityService.js";
import { logOk, logServerErr } from "../services/LogService.js";
import { Profile_ } from "../services/ProfileService.js";
import { User_ } from "../services/UserService.js";
import { toNumber } from "../utils/number.js";
import { serviceResultBadHandler } from "../utils/services.js";

class ProfileController {
  static checkUsername = async (req, res) => {
    const { username } = req.query;
    const requesterUsername = req?.user?.profile?.username;

    try {
      let available = false;
      if (username === requesterUsername) available = true;
      else {
        let result = await Profile_.usernameAvailable(username);

        if (serviceResultBadHandler(result, res, "Username check failed"))
          return;

        available = result.info;
      }

      if (available)
        res.ok("Username Available", {
          isAvailable: available,
        });
      else res.failure("Username Unavailable", 409, { isAvailable: available });

      logOk(
        "Username check",
        "Someone checked if a certain username is available or not",
        { username, isAvailable: available }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static create = async (req, res) => {
    const userId = req.userId;
    const body = req.body;

    try {
      let result = await Profile_.create(
        body.fullName,
        body.about,
        body.gender,
        body.profileImageUrl,
        body.dob,
        body.username,
        userId
      );

      if (serviceResultBadHandler(result, res, "Profile creation failed"))
        return;

      const user = result.info.profile;

      res.ok("Profile created", { user });

      logOk("Profile created", "A user created thier profile", { user });
      activity("Profile created", "A user created thier profile");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static update = async (req, res) => {
    const profileId = req.user.profile.id;

    try {
      let result = await Profile_.update(req.body, profileId);

      if (serviceResultBadHandler(result, res, "Profile updation failed"))
        return;

      const user = result.info.profile;

      res.ok("Profile updated", { user });

      logOk("Profile updated", "A user updated thier profile", { user });
      activity("Profile updated", "A user created thier profile");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static get = async (req, res) => {
    const profileId = req.query.profileId;
    if (profileId === req?.user?.profile?.id) {
      try {
        let result = await Profile_.getById(profileId);

        if (serviceResultBadHandler(result, res, "Profile request failed"))
          return;

        const profile = result.info.profile;

        res.ok("Profile delivered", { profile });

        logOk("Profile delivered", "User requested their own profile", {
          profileId,
          profile,
        });
      } catch (err) {
        logServerErr(err);
        res.serverError();
      }
      return;
    }

    try {
      let result = await Profile_.getById(profileId);

      if (serviceResultBadHandler(result, res, "Profile request failed"))
        return;

      const profile = result.info.profile;

      res.ok("Profile delivered", { profile });

      logOk("Profile delivered", "User requested profile of some other user", {
        userProfileId: req?.user?.profile?.id,
        profileId,
        profile,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getMine = async (req, res) => {
    const profileId = req?.user?.profile?.id;

    try {
      let result = await Profile_.getById(profileId);

      if (serviceResultBadHandler(result, res, "Profile request failed"))
        return;

      const profile = result.info.profile;

      res.ok("Profile delivered", { profile });

      logOk("Profile delivered", "User requested their own profile", {
        profileId,
        profile,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getProfileForums = async (req, res) => {
    const reqProfileId = req?.user?.profile?.id;
    let { profileId, offset } = req.query;

    offset = toNumber(offset);

    try {
      let result = await Profile_.getForums(profileId, reqProfileId, offset);

      if (serviceResultBadHandler(result, res, "Profile forums request failed"))
        return;

      const forums = result.info.forums;

      res.ok("Forums delivered", {
        forums,
        newOffset:
          forums.length < Profile_.forumsLimit ? null : offset + forums.length,
      });

      logOk(
        "Profile Forums delivered",
        "A user requested for someone's or thier own forums",
        { profileId, reqProfileId, offset }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getUsers = async (req, res) => {
    let offset = toNumber(req.query.offset);

    try {
      let result = await Profile_.getAll(offset);

      if (serviceResultBadHandler(result, res, "Users fetch failed")) return;

      const users = result.info.users;

      res.ok("Users", {
        users,
        newOffset:
          users.length < Profile_.usersLimit ? null : users.length + offset,
      });

      logOk("User delivered", "A user requested users");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const userId = req.userId;

    try {
      let result = await User_.delete(userId);

      if (serviceResultBadHandler(result, res, "User deletion failed")) return;

      res.ok("Deleted");

      logOk("User deleted", "A user deleted thier account", { userId });
      activity("User delete", "A user deleted thier account");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default ProfileController;
