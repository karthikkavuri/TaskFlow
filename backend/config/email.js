const sgMail = require("@sendgrid/mail");

// Initialize SendGrid
try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid initialized successfully");
  console.log(`📧 From Email: ${process.env.SENDGRID_FROM_EMAIL}`);
} catch (error) {
  console.error("❌ SendGrid initialization failed:", error.message);
}

// Email template for OTP verification
const getVerificationEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container { 
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 0;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content { 
                padding: 40px 30px;
                color: #333;
                line-height: 1.6;
            }
            .otp-container {
                text-align: center;
                margin: 40px 0;
                background-color: #f0f0f0;
                padding: 30px;
                border-radius: 8px;
                border: 2px solid #667eea;
            }
            .otp-code {
                font-size: 48px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #667eea;
                font-family: 'Courier New', monospace;
                margin: 0;
            }
            .otp-label {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
            }
            .footer { 
                background-color: #f9f9f9;
                text-align: center;
                padding: 20px;
                color: #999;
                font-size: 12px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ VibeCode</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <p>Hello there! 👋</p>
                <p>Thank you for signing up! Please use the OTP below to verify your email:</p>
                <div class="otp-container">
                    <p class="otp-code">${otp}</p>
                    <p class="otp-label">This OTP expires in 10 minutes</p>
                </div>
                <p>If you didn’t sign up you can ignore this.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 VibeCode. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send email function
const sendEmail = async (to, subject, htmlContent, otp = null) => {
  try {
    console.log("📧 Preparing email...");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${process.env.SENDGRID_FROM_EMAIL}`);

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not set");
    }
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error("SENDGRID_FROM_EMAIL is not set");
    }

    // Include OTP in subject if provided
    let finalSubject = subject;
    if (otp) {
      finalSubject = `${subject} - OTP: ${otp}`;
    }

    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || "VibeCode",
      },
      subject: finalSubject,
      html: htmlContent,
      // required tracking_settings fields so SendGrid accepts the request
      tracking_settings: {
        click_tracking: {
          enable: true, 
          enable_text: true,
        },
        open_tracking: {
          enable: true,
        },
      },
    };

    console.log("🚀 Sending via SendGrid...");
    const info = await sgMail.send(msg);

    console.log("✅ Email sent successfully");
    console.log(`   Response Status: ${info[0].statusCode}`);
    return info;
  } catch (error) {
    console.error("❌ MAIL SENDING ERROR:");
    console.error(`   Error: ${error.message}`);

    if (error.response) {
      console.error("   Response Status:", error.response.status);
      console.error("   Response Body:", error.response.body);
    }

    throw new Error(`Email service failed: ${error.message}`);
  }
};

module.exports = { sendEmail, getVerificationEmailTemplate };