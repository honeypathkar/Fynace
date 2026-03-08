const nodemailer = require("nodemailer");

/**
 * Handles early access application requests.
 * Sends:
 *   1. Admin notification email (to honeypatkar70@gmail.com)
 *   2. User confirmation email with app download link
 */
exports.handleEarlyAccess = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and email.",
      });
    }

    const downloadUrl =
      process.env.APP_DOWNLOAD_URL || "https://fynace.in/download";
    const senderEmail = process.env.EMAIL_FROM || "support@fynace.in";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "honeypatkar70@gmail.com",
        pass: process.env.SMTP_PASS,
      },
    });

    // ─── Email 1: Admin notification (Original Template Restored) ──────────
    const adminMail = {
      from: `"Fynace Landing" <${senderEmail}>`,
      to: "honeypatkar70@gmail.com",
      replyTo: email,
      subject: `Fynace Early Access Application: ${name}`,
      html: `
        <div style="background-color: #030712; padding: 40px 20px; font-family: 'Bricolage Grotesque', Arial, sans-serif; color: #f8fafc; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); text-align: left;">
            <div style="margin-bottom: 32px; text-align: center;">
               <h2 style="color: #6366f1; margin: 0; font-size: 24px; letter-spacing: -0.02em;">Fynace Early Access</h2>
               <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">New Lead Application</p>
            </div>
            
            <div style="padding: 24px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px;">Applicant Name</label>
                <div style="font-size: 16px; font-weight: 500;">${name}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px;">Email Address</label>
                <div style="font-size: 16px; font-weight: 500; color: #6366f1;">${email}</div>
              </div>
              
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px;">Message</label>
                <div style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">${message || "No message provided."}</div>
              </div>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0;">This application was sent via Fynace Landing Page</p>
            </div>
          </div>
          <div style="margin-top: 24px; font-size: 12px; color: #475569;">
            &copy; 2026 Fynace. All rights reserved.
          </div>
        </div>
      `,
    };

    // ─── Email 2: User confirmation matching Admin template aesthetics ───
    const userMail = {
      from: `"Fynace" <${senderEmail}>`,
      to: email,
      subject: `Welcome to Fynace, ${name.split(" ")[0]}! 🎉 Here's your download link`,
      html: `
        <div style="background-color: #f8fafc; padding: 0px; font-family: Arial, sans-serif; color: #1e293b; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="margin-bottom: 24px; text-align: center;">
               <h2 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: bold;">Fynace</h2>
            </div>
            
            <div style="margin-bottom: 24px;">
              <h1 style="font-size: 20px; margin: 0 0 12px; color: #0f172a;">You're in, ${name.split(" ")[0]}! 🎉</h1>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
                Thank you for joining the Fynace early access program. Your journey to smarter finances starts right now.
              </p>
            </div>
            
            <div style="padding: 24px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; margin-bottom: 24px;">
              <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 16px;">Fynace for Android</h2>
              
              <a href="${downloadUrl}" 
                 style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px;">
                Download App Now
              </a>
            </div>

            <div style="margin-bottom: 24px; font-size: 15px; color: #475569; line-height: 1.6;">
              <p style="margin: 0;"><strong>Please use the app, and give us your feedback.</strong> Your feedback matters to us immensely and will shape the future of Fynace.</p>
            </div>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Questions? We're here to help at <a href="mailto:support@fynace.in" style="color: #6366f1; text-decoration: none;">support@fynace.in</a></p>
            </div>
          </div>
          
          <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            &copy; 2026 Fynace. All rights reserved.<br>
            You received this because you requested early access at fynace.in.
          </div>
        </div>
      `,
    };

    // Send emails sequentially and handle failures individually
    let adminSent = false;
    let userSent = false;

    try {
      await transporter.sendMail(adminMail);
      adminSent = true;
    } catch (e) {
      console.error("Admin mail sending failed:", e);
    }

    try {
      await transporter.sendMail(userMail);
      userSent = true;
    } catch (e) {
      console.error("User mail sending failed:", e);
    }

    if (!adminSent && !userSent) {
      throw new Error("Both emails failed to send due to SMTP rejection.");
    }

    return res.status(200).json({
      success: true,
      message: "Application submitted! Check your email for the download link.",
    });
  } catch (error) {
    console.error("Early Access Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
