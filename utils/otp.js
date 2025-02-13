import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { NODEMAILER } from "../constants/env.js";

const transportEmail = {
  service: NODEMAILER.SERVICE,
  auth: {
    user: NODEMAILER.EMAIL,
    pass: NODEMAILER.PASSWORD,
  },
};

/**
 * Sends an OTP with predefined values to the recipient mail
 * @param {string} recipient Recipient's E-Mail address
 * @param {string} otp 
 * @returns {Promise<void>}
 */
const sendOtpEmail = async (recipient, otp) => {
  const mailOptions = {
    from: NODEMAILER.EMAIL,
    to: recipient,
    subject: "Verification OTP | CampusVibe",
    text: "OTP : " + otp,
  };

  const transporter = nodemailer.createTransport(transportEmail);

  try {
    await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.log(err);
  }

  return false;
};

/**
 * Generates an OTP
 * @param {number | 8} length
 * @param {boolean | true} allDigits 
 * @returns {string} 
 */
const generateOtp = (length = 8, allDigits = true) => {
  const uniqStr = (uuidv4() + Date.now().toString()).replace("-", "");
  const otp = allDigits ? uniqStr.replace(/[A-Za-z]/g, "") : uniqStr;

  return otp.substring(0, length > 0 ? length : 6).toUpperCase();
};

const otp = {
  generate: generateOtp,
  send: sendOtpEmail,
};

export default otp;
