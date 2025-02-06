import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import emailConfig from "../constants/email.config.js";

const sendOtpEmail = async (recipient, otp) => {
  const mailOptions = {
    from: emailConfig.auth.user,
    to: recipient,
    subject: "Verification OTP | CampusVibe",
    text: "OTP : " + otp,
  };

  const transporter = nodemailer.createTransport(emailConfig);

  try {
    await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.log(err);
  }

  return false;
};

const generateOtp = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

const otp = {
  generate: generateOtp,
  send: sendOtpEmail,
};

export default otp;
