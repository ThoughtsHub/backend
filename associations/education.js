import Education from "../models/Education.js";
import Skill from "../models/Skill.js";

const educationAssociations = () => {
  // Education can have many skills
  // Skills can be in multiple educations
  Education.belongsToMany(Skill, {
    through: "educationSkills",
    foreignKey: "educationId",
    otherKey: "skillId",
    onDelete: "SET NULL",
  });
  Skill.belongsToMany(Education, {
    through: "educationSkills",
    foreignKey: "skillId",
    otherKey: "educationId",
    onDelete: "SET NULL",
  });
};

export default educationAssociations;
