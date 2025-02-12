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

const generateOtp = (length = 8) => {
  return (uuidv4()+uuidv4()+uuidv4())
    .replaceAll(/[A-Za-z-]/g, "")
    .substring(0, length > 0 ? length : 6)
    .toUpperCase();
};

const otp = {
  generate: generateOtp,
  send: sendOtpEmail,
};

export default otp;
