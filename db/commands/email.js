import { client } from "../connect.js";

const createEmailOtpKey = async (email, otp) => {
  try {
    await client.del(`otp:${email}`);
    await client.setEx(`otp:${email}`, 5 * 60, otp);

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

const verifyEmailOtpKey = async (email, otp) => {
  try {
    const setOtp = await client.get(`otp:${email}`);
    if (setOtp === null) return false;

    await client.del(`otp:${email}`);

    return otp === setOtp;
  } catch (err) {
    console.log(err);

    return false;
  }
};

const _otp = {
  create: createEmailOtpKey,
  verify: verifyEmailOtpKey,
};

export default _otp;
