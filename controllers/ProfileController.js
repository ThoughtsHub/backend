import activity from "../services/ActivityService.js";
import log, { logBad, logOk, logServerErr } from "../services/LogService.js";
import { Profile_ } from "../services/ProfileService.js";
import { toNumber } from "../utils/number.js";
import { serviceCodes } from "../utils/services.js";

class ProfileController {
  static checkUsername = async (req, res) => {
    const { username } = req.query;

    try {
      let result = await Profile_.usernameAvailable(username);
      if (result.code !== serviceCodes.OK) {
        logBad("Check failed", "Username availability check failed");
        return res.failure(result.code, { isAvailable: false });
      }

      const available = result.info;

      res.ok(`Username ${available ? "A" : "Una"}vailable`, {
        isAvailable: available,
      });

      logOk(
        "Username check",
        "Someone checked if a certain username is available or not",
        { username }
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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Profile Creation failed",
          `Reason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Profile Updation failed",
          `Reason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

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
        if (result.code !== serviceCodes.OK) {
          logBad(
            `Profile request failed", "A user could not be able to see thier profile; \nReason : ${result.code}`,
            { profileId }
          );
          return res.failure(result.code);
        }

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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Profile request failed",
          `A user requested profile of someone other; \nReason: ${result.code}`,
          { profileId }
        );
        return res.failure(result.code);
      }

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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Profile request failed",
          `A user could not be able to see thier profile; \nReason : ${result.code}`,
          { profileId }
        );
        return res.failure(result.code);
      }

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
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Profile Forum Request failed",
          `A user requested for forums of a profile; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

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
      if (result.code !== serviceCodes.OK) {
        logBad("Users fetch failed", `Reason: ${result.code}`, { offset });
        return res.failure(result.code);
      }

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
}

export default ProfileController;
