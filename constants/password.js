const pass = {
  salt: 10,
  secret: process.env.PASSWORD_SECRET_SALT || "supersecret",
};

export default pass;
