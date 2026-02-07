const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// Create reusable transporter object using Brevo SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

// Send OTP via Email
const sendOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    const logoPath =
      "/Users/honey-kalpintelligence/Desktop/Honey/expenss-tracker/frontend/public/images/logo.png";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Fynace - OTP Verification",
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "fynace-logo",
        },
      ],
      html: `
        <div style="background-color: #030712; padding: 20px 10px; font-family: 'Bricolage Grotesque', Arial, sans-serif; color: #f8fafc; text-align: center;">
          <div style="max-width: 440px; margin: 0 auto; background-color: #0f172a; padding: 32px 24px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
            <div style="margin-bottom: 32px;">
               <img src="cid:fynace-logo" alt="Fynace Logo" style="width: 50px; height: 50px; border-radius: 10px; margin-bottom: 12px;">
               <h1 style="color: #6366f1; margin: 0; font-size: 24px; letter-spacing: -0.02em; font-weight: 800;">Fynace</h1>
               <div style="height: 1px; width: 32px; background: #6366f1; margin: 12px auto;"></div>
               <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Verify your identity</p>
            </div>
            
            <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
              Please use the verification code below to sign in to your Fynace account.
            </p>

            <div style="padding: 16px; background: rgba(99, 102, 241, 0.08); border-radius: 16px; border: 1px dashed #6366f1; margin-bottom: 24px;">
               <div style="font-size: 32px; font-weight: 800; color: #f8fafc; letter-spacing: 8px; text-indent: 8px; display: inline-block;">${otp}</div>
            </div>

            <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
              This code will expire in <span style="color: #94a3b8; font-weight: 600;">10 minutes</span>.
            </p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="font-size: 11px; color: #475569; margin: 0; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your address by mistake.
              </p>
            </div>
          </div>
          <div style="margin-top: 24px; font-size: 11px; color: #334155;">
            &copy; 2026 Fynace. All rights reserved.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = {
  generateOTP,
  sendOTP,
};
