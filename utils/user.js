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
  userData.isProfile = userData.profile !== null;

  return userData;
};

const updateUsername = async (userId, username, t) => {
  await User.update(
    { username, usernameSet: true },
    {
      where: { id: userId },
      transaction: t,
      individualHooks: true,
      fields: ["username", "usernameSet"],
    }
  );
};

const user = {
  getUserData,
  updateUsername,
};

export default user;
