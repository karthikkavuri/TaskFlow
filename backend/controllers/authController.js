const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail, getVerificationEmailTemplate } = require("../config/email");

// Cooldown tracking (use Redis in production)
const emailCooldown = new Map();
// Pending registrations stored in-memory until OTP verification
// Map<email, { name, email, password, otpHash, otpExpiry }>
const pendingRegistrations = new Map();

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d",
  });

  return { accessToken, refreshToken };
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    const lowerEmail = email.toLowerCase();

    // Check if a real user already exists
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // If there's already a pending registration, regenerate OTP and resend
    if (pendingRegistrations.has(lowerEmail)) {
      const pending = pendingRegistrations.get(lowerEmail);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      pending.otpHash = crypto.createHash("sha256").update(otp).digest("hex");
      pending.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      pendingRegistrations.set(lowerEmail, pending);

      const emailTemplate = getVerificationEmailTemplate(otp);
      try {
        await sendEmail(lowerEmail, "VibeCode - Verify Your Email (OTP)", emailTemplate, otp);
      } catch (emailError) {
        console.error("❌ OTP resend failed:", emailError.message);
        return res.status(500).json({ message: "Failed to send OTP. Try again later." });
      }

      return res.status(200).json({ success: true, message: "OTP resent to email" });
    }

    // Create a pending registration (do NOT create DB user yet)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingRegistrations.set(lowerEmail, {
      name,
      email: lowerEmail,
      password,
      otpHash,
      otpExpiry,
    });

    // Send OTP email
    const emailTemplate = getVerificationEmailTemplate(otp);
    try {
      await sendEmail(lowerEmail, "VibeCode - Verify Your Email (OTP)", emailTemplate, otp);
      console.log(`📧 OTP email queued for: ${lowerEmail}`);
    } catch (emailError) {
      console.error("❌ OTP email failed:", emailError.message);
      pendingRegistrations.delete(lowerEmail);
      return res.status(500).json({ message: "Email service unavailable. Please try again later." });
    }

    res.status(201).json({
      success: true,
      message: "✅ Signup initiated. OTP sent to email. Please verify to complete registration.",
      email: lowerEmail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const lowerEmail = email.toLowerCase();

    // First check pending registrations (users not yet saved)
    if (pendingRegistrations.has(lowerEmail)) {
      const pending = pendingRegistrations.get(lowerEmail);
      if (pending.otpHash !== otpHash || pending.otpExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Create the real user now
      const newUser = new User({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        emailVerified: true,
      });

      await newUser.save();
      // remove pending registration
      pendingRegistrations.delete(lowerEmail);

      // issue tokens
      const { accessToken, refreshToken } = generateTokens(newUser._id);

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          emailVerified: newUser.emailVerified,
        },
      });
    }

    // Fallback: support verifying existing user records that store OTP
    const user = await User.findOne({
      email: lowerEmail,
      emailVerificationOtp: otpHash,
      emailVerificationOtpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.emailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpiry = undefined;
    await user.save();

    // Generate tokens now that verification is complete
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verify-email
// @access  Public
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check cooldown (max 1 resend per 60 seconds)
    const lastAttempt = emailCooldown.get(email);
    if (lastAttempt && Date.now() - lastAttempt < 60000) {
      const waitTime = Math.ceil((60000 - (Date.now() - lastAttempt)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${waitTime} seconds before resending`,
        retryAfter: waitTime
      });
    }

    const lowerEmail = email.toLowerCase();

    // If there's a pending registration, regenerate OTP and resend
    if (pendingRegistrations.has(lowerEmail)) {
      const pending = pendingRegistrations.get(lowerEmail);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      pending.otpHash = crypto.createHash("sha256").update(otp).digest("hex");
      pending.otpExpiry = Date.now() + 10 * 60 * 1000;
      pendingRegistrations.set(lowerEmail, pending);

      const emailTemplate = getVerificationEmailTemplate(otp);
      try {
        await sendEmail(lowerEmail, "VibeCode - Verify Your Email (Resend)", emailTemplate, otp);
        console.log(`📧 Resend OTP email queued for: ${lowerEmail}`);
      } catch (emailError) {
        console.error("❌ Resend email failed:", emailError.message);
        return res.status(500).json({ message: "Failed to send email. Please try again later." });
      }

      emailCooldown.set(lowerEmail, Date.now());
      return res.status(200).json({ success: true, message: "✅ OTP resent successfully!", nextResendTime: 60 });
    }

    // Otherwise, handle existing (saved) users
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP and send
    const otp = user.generateEmailOTP();
    await user.save();

    const emailTemplate = getVerificationEmailTemplate(otp);

    try {
      await sendEmail(lowerEmail, "VibeCode - Verify Your Email (Resend)", emailTemplate, otp);
      console.log(`📧 Resend OTP email queued for: ${lowerEmail}`);
    } catch (emailError) {
      console.error("❌ Resend email failed:", emailError.message);
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

    // Update cooldown
    emailCooldown.set(lowerEmail, Date.now());

    res.status(200).json({ success: true, message: "✅ Verification email sent successfully!", nextResendTime: 60 });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const { accessToken } = generateTokens(decoded.userId);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async(req , res, next)=>{
  try{
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const lowerEmail = email.toLowerCase();
      
      // Check cooldown
      const now = Date.now();
      const lastRequest = emailCooldown.get(lowerEmail);
      if (lastRequest && now - lastRequest < 60000) {
        const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${waitTime} seconds before requesting another OTP`,
          nextResendTime: waitTime
        });
      }

      const user = await User.findOne({ email: lowerEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const otp = user.generateEmailOTP();
      await user.save();

      // Create password reset email template
      const emailTemplate = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #667eea;">Task Flow</h2>
          </div>
          <h3 style="color: #333;">Password Reset OTP</h3>
          <p style="color: #666; line-height: 1.6;">
            Hi ${user.name},<br><br>
            You requested a password reset for your Task Flow account. Use the OTP below:
          </p>
          <div style="background-color: #f8f9fa; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `;

    try {
      await sendEmail(lowerEmail, "Password Reset OTP - Task Flow", emailTemplate);
      console.log(`📧 Password reset OTP sent to: ${lowerEmail}`);
    } catch (emailError) {
      console.error("❌ Password reset email failed:", emailError.message);
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

    // Update cooldown
    emailCooldown.set(lowerEmail, Date.now());
    res.status(200).json({ success: true, message: "OTP sent to your email", nextResendTime: 60 });
  } catch (error) {
    next(error);
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
     const {newPassword , email} = req.body;
     await User.findOneAndUpdate({ email }, { password: newPassword });
     res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}