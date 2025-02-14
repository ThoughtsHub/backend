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
 * @returns {Promise<boolean>}
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
 * Sends a otp on the recipient's mobile number or whatsapp
 * @param {string} recipient
 * @param {string} otp
 * @returns {Promise<boolean>}
 */
const sendOtpMobile = async (recipient, otp) => {
  // TODO: add logic to send otp on mobile or whatsapp

  return false;
};

/**
 * Generates an OTP
 * @param {number | 8} length
 * @param {boolean | true} allDigits
 * @returns {string}
 */
const generateOtp = (length = 8, allDigits = true) => {
  const uniqStr = (uuidv4() + Date.now().toString()).replaceAll("-", "");
  const otp = allDigits ? uniqStr.replace(/[A-Za-z]/g, "") : uniqStr;

  return otp.substring(0, length > 0 ? length : 6).toUpperCase();
};

const otp = {
  generate: generateOtp,
  sendEmail: sendOtpEmail,
  sendMobile: sendOtpMobile,
};

export default otp;
