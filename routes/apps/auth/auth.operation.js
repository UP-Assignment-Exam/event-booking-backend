const util = require("../../../exports/util");
const User = require("../../../models/AppUsers.model");
const OTPToken = require("../../../models/OtpToken.model");
const bcrypt = require('bcryptjs');
const EmailService = require("../../../exports/mailer");
const jwt = require('jsonwebtoken');
const UserService = require("../../../services/app-user.service");

// ====================
// LOGIN
// ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return util.ResFail(req, res, "Email and password are required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Please provide a valid email address.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return util.ResFail(req, res, "Invalid email or password.");
    }

    // Check if user is active
    if (!user.isActive) {
      return util.ResFail(req, res, "Your account has been deactivated. Please contact support.");
    }

    // Compare password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return util.ResFail(req, res, "Invalid email or password.");
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: String(user._id), 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get public user data
    const publicUser = await UserService.getPublicUser(user._id);

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
      $inc: { loginCount: 1 }
    });

    return util.ResSuss(req, res, {
      token: `Bearer ${token}`,
      user: publicUser
    }, "Login successful!");

  } catch (error) {
    console.error('Login error:', error);
    return util.ResFail(req, res, "An error occurred during login. Please try again.");
  }
};

// ====================
// REGISTER
// ====================
const register = async (req, res) => {
  try {
    const { email, username, firstName, lastName, password } = req.body;

    // Validate input
    if (!email || !username || !firstName || !lastName || !password) {
      return util.ResFail(req, res, "All fields are required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Please provide a valid email address.");
    }

    if (username.length < 3) {
      return util.ResFail(req, res, "Username must be at least 3 characters long.");
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return util.ResFail(req, res, "First name and last name must be at least 2 characters long.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return util.ResFail(req, res, "An account with this email already exists.");
      }
      if (existingUser.username === normalizedUsername) {
        return util.ResFail(req, res, "This username is already taken.");
      }
    }

    // Generate temporary password (user will set their own password via OTP)
    const hashedPassword = await util.hashedPassword(password);

    // Create new user
    const newUser = new User({
      email: normalizedEmail,
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hashedPassword,
      isActive: false, // User needs to verify email first
      emailVerified: false,
      createdAt: new Date()
    });

    const savedUser = await newUser.save();

    if (savedUser) {
      // Generate OTP for email verification
      const otp = util.generateOTP();
      const hashedOTP = util.hashToken(otp);

      // Save OTP token
      const otpToken = new OTPToken({
        userId: savedUser._id,
        email: normalizedEmail,
        otp: otp.substring(0, 2), // Store partial OTP for reference
        hashedOTP,
        purpose: 'email_verification',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        attempts: 0
      });

      await otpToken.save();

      // Send verification email
      const userData = {
        firstName,
        lastName,
        username: normalizedUsername,
        email: normalizedEmail,
        otp,
        purpose: 'email_verification'
      };

      await EmailService.sendOTPEmail(userData);

      return util.ResSuss(req, res, {
        userId: savedUser._id,
        email: normalizedEmail,
        message: "Registration successful! Please check your email for the verification code."
      }, "Account created successfully!");
    }

    return util.ResFail(req, res, "Failed to create account. Please try again.");

  } catch (error) {
    console.error('Registration error:', error);
    return util.ResFail(req, res, "An error occurred during registration. Please try again.");
  }
};

// ====================
// VERIFY OTP
// ====================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    // Validate input
    if (!email || !otp || !purpose) {
      return util.ResFail(req, res, "Email, OTP, and purpose are required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Invalid email format.");
    }

    if (otp.length !== 6) {
      return util.ResFail(req, res, "OTP must be 6 digits.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedOTP = util.hashToken(otp);

    // Find valid OTP token
    const otpToken = await OTPToken.findOne({
      email: normalizedEmail,
      hashedOTP,
      purpose,
      expiresAt: { $gt: new Date() },
      used: false
    });

    if (!otpToken) {
      // Check if there's an expired or used token
      const expiredToken = await OTPToken.findOne({
        email: normalizedEmail,
        purpose
      }).sort({ createdAt: -1 });

      if (expiredToken) {
        if (expiredToken.used) {
          return util.ResFail(req, res, "This OTP has already been used.");
        }
        if (expiredToken.expiresAt <= new Date()) {
          return util.ResFail(req, res, "OTP has expired. Please request a new one.");
        }
        if (expiredToken.attempts >= 3) {
          return util.ResFail(req, res, "Too many failed attempts. Please request a new OTP.");
        }
      }

      // Increment failed attempts
      if (expiredToken && !expiredToken.used) {
        await OTPToken.findByIdAndUpdate(expiredToken._id, {
          $inc: { attempts: 1 }
        });
      }

      return util.ResFail(req, res, "Invalid OTP. Please check and try again.");
    }

    // Find user
    const user = await User.findById(otpToken.userId);
    if (!user) {
      return util.ResFail(req, res, "User not found.");
    }

    // Mark OTP as used
    await OTPToken.findByIdAndUpdate(otpToken._id, {
      used: true,
      usedAt: new Date()
    });

    // Handle different purposes
    switch (purpose) {
      case 'email_verification':
        await User.findByIdAndUpdate(user._id, {
          emailVerified: true,
          isActive: true,
          emailVerifiedAt: new Date()
        });
        
        // Generate JWT for immediate login
        const token = jwt.sign(
          { 
            id: String(user._id), 
            email: user.email,
            username: user.username 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        const publicUser = await UserService.getPublicUser(user._id);

        return util.ResSuss(req, res, {
          token: `Bearer ${token}`,
          user: publicUser,
          verified: true
        }, "Email verified successfully! You are now logged in.");

      case 'password_reset':
        return util.ResSuss(req, res, {
          resetAllowed: true,
          userId: user._id
        }, "OTP verified. You can now reset your password.");

      default:
        return util.ResFail(req, res, "Invalid purpose specified.");
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    return util.ResFail(req, res, "An error occurred during OTP verification.");
  }
};

// ====================
// RESEND OTP
// ====================
const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // Validate input
    if (!email || !purpose) {
      return util.ResFail(req, res, "Email and purpose are required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Invalid email format.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return util.ResFail(req, res, "User not found.");
    }

    // Check for recent OTP request (rate limiting)
    const recentOTP = await OTPToken.findOne({
      email: normalizedEmail,
      purpose,
      createdAt: { $gt: new Date(Date.now() - 60000) } // 1 minute ago
    });

    if (recentOTP) {
      return util.ResFail(req, res, "Please wait 60 seconds before requesting a new OTP.");
    }

    // Delete any existing unused OTP tokens for this purpose
    await OTPToken.deleteMany({
      email: normalizedEmail,
      purpose,
      used: false
    });

    // Generate new OTP
    const otp = util.generateOTP();
    const hashedOTP = util.hashToken(otp);

    // Save new OTP token
    const otpToken = new OTPToken({
      userId: user._id,
      email: normalizedEmail,
      otp: otp.substring(0, 2),
      hashedOTP,
      purpose,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      attempts: 0
    });

    await otpToken.save();

    // Send OTP email
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: normalizedEmail,
      otp,
      purpose
    };

    await EmailService.sendOTPEmail(userData);

    return util.ResSuss(req, res, null, "New OTP has been sent to your email.");

  } catch (error) {
    console.error('Resend OTP error:', error);
    return util.ResFail(req, res, "An error occurred while sending OTP.");
  }
};

// ====================
// FORGOT PASSWORD
// ====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return util.ResFail(req, res, "Email address is required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Please provide a valid email address.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return util.ResSuss(req, res, null, "If an account with that email exists, we have sent a password reset code.");
    }

    // Check for recent password reset request
    const recentReset = await OTPToken.findOne({
      email: normalizedEmail,
      purpose: 'password_reset',
      createdAt: { $gt: new Date(Date.now() - 60000) } // 1 minute ago
    });

    if (recentReset) {
      return util.ResFail(req, res, "Please wait 60 seconds before requesting another password reset.");
    }

    // Delete any existing unused password reset OTPs
    await OTPToken.deleteMany({
      email: normalizedEmail,
      purpose: 'password_reset',
      used: false
    });

    // Generate OTP
    const otp = util.generateOTP();
    const hashedOTP = util.hashToken(otp);

    // Save OTP token
    const otpToken = new OTPToken({
      userId: user._id,
      email: normalizedEmail,
      otp: otp.substring(0, 2),
      hashedOTP,
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      attempts: 0
    });

    await otpToken.save();

    // Send password reset OTP email
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: normalizedEmail,
      otp,
      purpose: 'password_reset'
    };

    await EmailService.sendOTPEmail(userData);

    return util.ResSuss(req, res, null, "If an account with that email exists, we have sent a password reset code.");

  } catch (error) {
    console.error('Forgot password error:', error);
    return util.ResFail(req, res, "An error occurred. Please try again later.");
  }
};

// ====================
// RESET PASSWORD
// ====================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !newPassword || !confirmPassword) {
      return util.ResFail(req, res, "All fields are required.");
    }

    if (!util.validateEmail(email)) {
      return util.ResFail(req, res, "Invalid email format.");
    }

    if (newPassword !== confirmPassword) {
      return util.ResFail(req, res, "Passwords do not match.");
    }

    if (newPassword.length < 8) {
      return util.ResFail(req, res, "Password must be at least 8 characters long.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return util.ResFail(req, res, "User not found.");
    }

    // Check if user has verified OTP for password reset
    const verifiedOTP = await OTPToken.findOne({
      email: normalizedEmail,
      purpose: 'password_reset',
      used: true,
      usedAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Used within last 5 minutes
    }).sort({ usedAt: -1 });

    if (!verifiedOTP) {
      return util.ResFail(req, res, "Please verify your OTP first before resetting password.");
    }

    // Hash new password
    const hashedPassword = await util.hashedPassword(newPassword);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordChangedAt: new Date()
    });

    // Delete all password reset OTP tokens for this user
    await OTPToken.deleteMany({
      email: normalizedEmail,
      purpose: 'password_reset'
    });

    return util.ResSuss(req, res, null, "Password has been reset successfully. You can now login with your new password.");

  } catch (error) {
    console.error('Reset password error:', error);
    return util.ResFail(req, res, "An error occurred while resetting password.");
  }
};

// ====================
// LOGOUT
// ====================
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout activity
    const userId = req.user?.id;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        lastLogoutAt: new Date()
      });
    }

    return util.ResSuss(req, res, null, "Logged out successfully.");

  } catch (error) {
    console.error('Logout error:', error);
    return util.ResFail(req, res, "An error occurred during logout.");
  }
};

module.exports = {
  login,
  register,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  logout
};