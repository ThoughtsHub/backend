import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { google } from "../env/env.config.js";
import { create } from "venom-bot";
import { puppeteer } from "../env/env.config.js";

const client = await create({
  session: "otp-sender",
  headless: "new",
  browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
  addBrowserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
  ...(puppeteer.isOptions
    ? {
        puppeteerOptions: {
          executablePath: puppeteer.executablePath,
        },
      }
    : {}),
});

const transportEmail = {
  service: "gmail",
  auth: {
    user: google.email,
    pass: google.password,
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
    from: google.email,
    to: recipient,
    subject: "Verification OTP | ThoughtsHub",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
      <h2 style="color: #4CAF50; text-align: center;">ThoughtsHub Verification</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Your One-Time Password (OTP) for verification is:</p>
      <div style="background: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="color: #4CAF50; margin: 0;">${otp}</h1>
      </div>
      <p style="font-size: 16px;">Please use this OTP to complete your verification process. Do not share this OTP with anyone.</p>
      <p style="font-size: 16px;">If you did not request this OTP, please ignore this email.</p>
      <hr style="border: 1px solid #ddd;">
      <p style="font-size: 14px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} CampusVibe. All rights reserved.</p>
    </div>
  `,
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
  try {
    client.sendText(`91${recipient}@c.us`, `Your OTP is ${otp}`);
    return true;
  } catch (err) {
    console.log(err);
  }
  return false;
};

/**
 * Generates an OTP
 * @param {number | 6} length
 * @param {boolean | true} allDigits
 * @returns {string}
 */
const generateOtp = (length = 6, allDigits = true) => {
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
