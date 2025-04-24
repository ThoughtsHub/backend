const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{3,}$/;
const fullNameRegex = /^.{3,}$/;

export const usernameCheck = (username) => {
  if (typeof username !== "string") return false;
  username = username.trim();

  if (!usernameRegex.test(username)) return false;
  return username;
};

export const fullNameCheck = (fullName) => {
  if (typeof fullName !== "string") return false;
  fullName = fullName.trim();

  if (!fullNameRegex.test(fullName)) return false;
  return fullName;
};

export const aboutCheck = (about) => {
  if (typeof about !== "string") return false;
  about = about.trim();

  return about;
};

export const genderCheck = (gender) => {
  if (typeof gender !== "string") return false;
  gender = gender.trim().toLowerCase();

  if (gender[0] === "m") return "Male";
  if (gender[0] === "f") return "Female";
  return "Other";
};

export const dobCheck = (dob) => {
  if (typeof dob !== "number") return false;

  // current age should be 15-80
  const ageInMs = Date.now() - dob;
  const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000); // account for leap years

  if (ageInYears < 15 || ageInYears > 80) return false;

  return dob;
};
