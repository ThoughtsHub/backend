import _env from "./env.js";

const emailConfig = {
  service: _env.nodemailer.SERVICE,
  auth: {
    user: _env.nodemailer.EMAIL,
    pass: _env.nodemailer.PASSWORD,
  },
};

export default emailConfig;
