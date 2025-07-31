const logger = require("../../../helpers/logger.helper");
const dbUtil = require("../../../exports/db.export");
const util = require("../../../exports/util");
const User = require("../../../models/AppUsers.model");
const UserService = require("../../../services/app-user.service");
const EmailService = require("../../../exports/mailer");

const getMe = async (req, res) => {
  try {
    const userId = req.user?._id

    const publicUser = await UserService.getPublicUser(userId);

    return util.ResSuss(req, res, publicUser)
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const updateCover = async (req, res) => {
  try {
    const userId = req.user?._id
    const { avatar } = req.body;

    await User.updateOne({
      _id: dbUtil.objectId(userId)
    }, {
      $set: { avatar: avatar }
    })

    return util.ResSuss(req, res, {})
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const updateBasic = async (req, res) => {
  try {
    const userId = req.user?._id
    const {
      username, firstName,
      lastName, email, phone
    } = req.body;

    await User.updateOne({
      _id: dbUtil.objectId(userId)
    }, {
      $set: {
        username, firstName,
        lastName, email, phone
      }
    })

    return util.ResSuss(req, res, {})
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

// ====================
// CHANGE PASSWORD
// ====================
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware that sets req.user
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return util.ResFail(req, res, "All password fields are required.");
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return util.ResFail(req, res, "New passwords do not match.");
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return util.ResFail(req, res, "New password must be at least 6 characters long.");
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return util.ResFail(req, res, "New password must be different from current password.");
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return util.ResFail(req, res, "User not found.");
    }

    // Check if user account is active
    if (!user.isActive) {
      return util.ResFail(req, res, "Account is not active. Please verify your email first.");
    }

    // Verify current password
    const isCurrentPasswordValid = await util.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return util.ResFail(req, res, "Current password is incorrect.");
    }

    // Hash the new password
    const hashedNewPassword = await util.hashedPassword(newPassword);

    // Update user password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedNewPassword,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (updatedUser) {
      // Optional: Send email notification about password change
      try {
        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username
        };
        
        // If you have an email service for password change notifications
        await EmailService.sendPasswordChangeNotification(userData);
      } catch (emailError) {
        console.error('Failed to send password change notification email:', emailError);
        // Don't fail the password change if email fails
      }

      return util.ResSuss(req, res, {
        message: "Password changed successfully!"
      }, "Password updated successfully!");
    }

    return util.ResFail(req, res, "Failed to change password. Please try again.");

  } catch (error) {
    console.error('Change password error:', error);
    return util.ResFail(req, res, "An error occurred while changing password. Please try again.");
  }
};

module.exports = {
  getMe,
  updateCover,
  updateBasic,
  changePassword
}