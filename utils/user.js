import Profile from "../models/Profile.js";
import User from "../models/user.js";

const getUserData = async (userId) => {
  const data = await User.findByPk(userId, {
    include: [{ model: Profile }],
  });

  if (data === null) throw new Error("Invalid user Id");

  const userData = data.get({ plain: true });
  userData.profile = userData.Profile;
  delete userData.Profile;

  return userData;
};

const user = {
  getUserData,
};

export default user;
