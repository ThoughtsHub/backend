import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";
import { fields as instituteFields } from "../data/loaded_data/loaded_data.js";
import Institute from "../models/Institute.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import ProfileEducation from "../models/ProfileEducation.js";
import { includeProfile, includeWriterWith } from "../constants/include.js";
import db from "../db/pg.js";
import InstituteReview from "../models/InstituteReviews.js";
import InsituteDiscussion from "../models/InstituteDiscussion.js";

class InstituteService {
  // Institute service codes
  static codes = {
    INST_NOT_EXIST: ["INSTITUTE DOES NOT EXIST", "Institute does not exist"],
    BAD_RATING: ["BAD RATING", "Rating should be in range 0-5"],
    BAD_REVIEW: ["BAD REVIEW", "Invalid review"],
    BAD_DISC: ["BAD DISCUSSION", "Invalid discussion"],
  };

  static institutesLimit = 30;
  static reviewsLimit = 30;
  static discsLimit = 30;
  static usersLimit = 30;

  static exists = async (instituteId) => {
    try {
      const institue = await Institute.findByPk(instituteId);
      return institue !== null;
    } catch (err) {
      return false;
    }
  };

  static getInstitutes = async (values, offset) => {
    const fields = [...instituteFields];

    const whereObj = {};
    for (const key in values) {
      if (fields.includes(key)) {
        const val = values[key];
        switch (key) {
          case "name":
            if (Validate.instituteField(val))
              whereObj.name = { [Op.iLike]: `%${val}%` };
            break;

          case "aisheCode":
            if (Validate.instituteField(val)) whereObj.aisheCode = val;
            break;

          case "state":
            if (Validate.instituteField(val)) whereObj.state = val;
            break;

          case "category":
            if (Validate.instituteField(val)) whereObj.category = val;
            break;

          case "type":
            if (Validate.instituteField(val)) whereObj.type = val;
            break;

          case "district":
            if (Validate.instituteField(val)) whereObj.district = val;
            break;

          case "about":
            if (Validate.instituteField(val))
              whereObj.about = { [Op.iLike]: `%${val}%` };
            break;

          case "type":
            if (Validate.instituteField(val)) whereObj.type = val;
            break;

          case "management":
            if (Validate.instituteField(val)) whereObj.management = val;
            break;

          case "universityName":
            if (Validate.instituteField(val))
              whereObj.universityName = { [Op.iLike]: `%${val}%` };
            break;

          case "universityType":
            if (Validate.instituteField(val)) whereObj.universityType = val;

          case "administrativeMinistry":
            if (Validate.instituteField(val))
              whereObj.administrativeMinistry = val;
            break;

          case "website":
            if (Validate.instituteField(val))
              whereObj.website = { [Op.iLike]: `%${val}%` };
            break;

          case "location":
            if (Validate.instituteField(val))
              whereObj.location = { [Op.iLike]: `%${val}%` };
            break;

          case "yearOfEstablishment":
            if (Validate.instituteField(val))
              whereObj.yearOfEstablishment = val;
            break;
        }
      }
    }

    try {
      let institutes = await Institute.findAll({
        where: { ...whereObj },
        limit: 30,
        offset,
        order: [[timestampsKeys.updatedAt, "desc"]],
        attributes: {
          exclude: ["id", "createDate", "updateDate"],
          include: [["id", "instituteId"]],
        },
      });
      institutes = institutes.map((i) => i.get({ plain: true }));

      return sRes(serviceCodes.OK, { institutes });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { values, offset }, err);
    }
  };

  static getInstitute = async (instituteId) => {
    try {
      let institute = await Institute.findOne({
        where: { id: instituteId },
        attributes: {
          exclude: ["id", "createDate", "updateDate"],
          include: [["id", "instituteId"]],
        },
      });
      institute = institute.get({ plain: true });

      return sRes(serviceCodes.OK, { institute });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteAisheCode }, err);
    }
  };

  static getUsers = async (instituteId, offset, profileId = null) => {
    try {
      let users = await ProfileEducation.findAll({
        where: { instituteId },
        offset,
        limit: this.usersLimit,
        include:
          profileId === null
            ? [includeProfile]
            : [includeWriterWith(profileId, false, "profile")],
      });

      users = users.map((u) => {
        u = u.get({ plain: true });
        u.profile.isFollowing =
          Array.isArray(u.profile.follow) && u.profile.follow.length === 1;
        delete u.profile.follow;
        return u.profile;
      });

      return sRes(serviceCodes.OK, { users });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteId, offset }, err);
    }
  };

  static writeReview = async (instituteId, profileId, review, rating) => {
    if (!(await this.exists(instituteId)))
      return sRes(this.codes.INST_NOT_EXIST, { profileId, instituteId });

    if (!Validate.rating(rating))
      return sRes(this.codes.BAD_RATING, { profileId, rating, instituteId });
    else if (typeof review !== "string")
      return sRes(this.codes.BAD_REVIEW, { instituteId, profileId, review });

    const t = await db.transaction();

    try {
      let institute = await Institute.findByPk(instituteId, { transaction: t });
      let review = await InstituteReview.create(
        { instituteId, profileId, review, rating },
        { transaction: t }
      );
      let newRating =
        (institute.rating * institute.ratedBy + rating) /
        (institute.ratedBy + 1);

      const [updateResult] = await Institute.update(
        { rating: newRating, ratedBy: institute.ratedBy + 1 },
        { where: { id: instituteId }, transaction: t }
      );
      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, {
          updateResult,
          instituteId,
          profileId,
        });
      }

      review = review.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { review });
    } catch (err) {
      await t.rollback();
      return sRes(
        serviceCodes.DB_ERR,
        { instituteId, profileId, rating, review },
        err
      );
    }
  };

  static getReviews = async (instituteId, offset) => {
    try {
      let reviews = await InstituteReview.findAll({
        where: { instituteId },
        offset,
        limit: this.reviewsLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      reviews = reviews.map((r) => r.get({ plain: true }));

      return sRes(serviceCodes.OK, { reviews });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteId }, err);
    }
  };

  static discuss = async (instituteId, profileId, discussionId, body) => {
    if (!(await this.exists(instituteId)))
      return sRes(this.codes.INST_NOT_EXIST, { profileId, instituteId });
    else if (typeof body !== "string")
      return sRes(this.codes.BAD_DISC, { instituteId, profileId, body });

    const t = await db.transaction();
    try {
      let disc = await InsituteDiscussion.create(
        { instituteId, profileId, discussionId, body },
        { transaction: t }
      );
      if (discussionId !== null)
        await Institute.increment(
          { discussions: 1 },
          { where: { id: instituteId }, transaction: t }
        );

      disc = disc.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { discussion: disc });
    } catch (err) {
      return sRes(
        serviceCodes.OK,
        { instituteId, profileId, discussionId, body },
        err
      );
    }
  };

  static getDiscussions = async (instituteId, discussionId, offset) => {
    try {
      let discs = await InsituteDiscussion.findAll({
        where: { instituteId, discussionId },
        offset,
        limit: this.discsLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      discs = discs.map((d) => d.get({ plain: true }));

      return sRes(serviceCodes.OK, { discussions: discs });
    } catch (err) {
      return sRes(serviceCodes.OK, { instituteId, discussionId, offset }, err);
    }
  };
}

export const Institute_ = InstituteService;
