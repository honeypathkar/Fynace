const nodemailer = require("nodemailer");

/**
 * Handles early access application requests
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

    // Email configuration using existing backend SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "honeypatkar70@gmail.com",
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || email,
      to: "honeypatkar70@gmail.com",
      replyTo: email,
      subject: `Fynace Early Access Application: ${name}`,
      text: `
        New application received from landing page:
        
        Name: ${name}
        Email: ${email}
        Message: ${message || "No message provided."}
      `,
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

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("Early Access Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
