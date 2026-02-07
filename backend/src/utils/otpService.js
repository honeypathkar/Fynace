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
      "/Users/honey-kalpintelligence/Desktop/Honey/expenss-tracker/fronted/public/images/logo.png";

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
        <div style="background-color: #030712; padding: 40px 20px; font-family: 'Bricolage Grotesque', Arial, sans-serif; color: #f8fafc; text-align: center;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #0f172a; padding: 48px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
            <div style="margin-bottom: 40px;">
               <img src="cid:fynace-logo" alt="Fynace Logo" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 16px;">
               <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -0.03em; font-weight: 800;">Fynace</h1>
               <div style="height: 1px; width: 40px; background: #6366f1; margin: 16px auto;"></div>
               <p style="color: #94a3b8; font-size: 16px; margin-top: 8px;">Verify your identity</p>
            </div>
            
            <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 32px; line-height: 1.6;">
              Please use the verification code below to sign in to your Fynace account.
            </p>

            <div style="padding: 24px; background: rgba(99, 102, 241, 0.08); border-radius: 20px; border: 1px dashed #6366f1; margin-bottom: 32px;">
               <div style="font-size: 42px; font-weight: 800; color: #f8fafc; letter-spacing: 12px; margin-left: 12px;">${otp}</div>
            </div>

            <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
              This code will expire in <span style="color: #94a3b8; font-weight: 600;">10 minutes</span>.
            </p>
            
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your address by mistake.
              </p>
            </div>
          </div>
          <div style="margin-top: 32px; font-size: 12px; color: #334155;">
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
