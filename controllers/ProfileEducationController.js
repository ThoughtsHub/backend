import { logOk, logServerErr } from "../services/LogService.js";
import { ProfileEducation_ } from "../services/ProfileEducation.js";
import { serviceResultBadHandler } from "../utils/services.js";

class ProfileEducationController {
  static get = async (req, res) => {
    const { profileId } = req.query;

    try {
      const result = await ProfileEducation_.get(profileId);
      if (
        serviceResultBadHandler(result, res, "Profile educations fetch failed")
      )
        return;

      const educations = result.info.educations;

      res.ok("Educations", { educations });

      logOk(
        "Profile education fetched",
        "A user requested education for a profile",
        { profileId }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static add = async (req, res) => {
    const profileId = req?.user?.profile?.id;
    const {
      instituteId,
      startYear,
      startMonth,
      endYear,
      endMonth,
      isCompleted = false,
    } = req.body;

    try {
      const result = await ProfileEducation_.add({
        profileId,
        instituteId,
        startYear,
        startMonth,
        endYear,
        endMonth,
        isCompleted,
      });
      if (serviceResultBadHandler(result, res, "Education add failed")) return;

      const education = result.info.education;

      res.ok("Education added", { education });

      logOk("Education added", "A user added an education to its profile", {
        profileId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static update = async (req, res) => {
    const profileId = req?.user?.profile?.id;

    try {
      const result = await ProfileEducation_.update(
        res.originalBody,
        req.body.educationId,
        profileId
      );
      if (serviceResultBadHandler(result, res, "Education update failed"))
        return;

      const education = result.info.education;

      res.ok("Education updated", { education });

      logOk("Education updated", "A user updated an education to its profile", {
        profileId,
        educationId: req.body.educationId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const profileId = req?.user?.profile?.id;
    const { educationId } = req.query;

    try {
      const result = await ProfileEducation_.remove(educationId, profileId);
      if (serviceResultBadHandler(result, res, "Education removal failed"))
        return;

      res.ok("Education removed");

      logOk("Education removed", "A user removed an education to its profile", {
        profileId,
        educationId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default ProfileEducationController;
