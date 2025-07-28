const { db, mongoose } = require("./settings/connection")

const otpTokenSchema = new mongoose.Schema({
  // Reference to the user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'app_users', // Adjust this to match your User model name
    required: true,
    index: true
  },

  // User's email address
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  // Partial OTP for reference/logging (first 3 digits)
  otp: {
    type: String,
    required: true,
    length: 3
  },

  // Hashed version of the full OTP for security
  hashedOTP: {
    type: String,
    required: true,
    index: true
  },

  // Purpose of the OTP
  purpose: {
    type: String,
    required: true,
    enum: [
      'email_verification',
      'password_reset',
      'account_activation',
      'phone_verification',
      'two_factor_auth',
      'account_recovery'
    ],
    index: true
  },

  // When the OTP expires
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  // Number of failed attempts
  attempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // Whether the OTP has been used
  used: {
    type: Boolean,
    default: false,
    index: true
  },

  // When the OTP was used
  usedAt: {
    type: Date,
    default: null
  },

  // IP address from which OTP was requested
  requestIP: {
    type: String,
    default: null
  },

  // User agent from which OTP was requested
  userAgent: {
    type: String,
    default: null
  },

  // When the OTP was created
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // When the OTP was last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This will automatically handle createdAt and updatedAt
  collection: 'otp_tokens'
});

// ====================
// INDEXES
// ====================

// Compound index for efficient queries
otpTokenSchema.index({ email: 1, purpose: 1, used: 1 });
otpTokenSchema.index({ userId: 1, purpose: 1 });
otpTokenSchema.index({ hashedOTP: 1, expiresAt: 1 });

// TTL index to automatically delete expired tokens after 24 hours
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// ====================
// METHODS
// ====================

// Instance method to check if OTP is expired
otpTokenSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt.getTime();
};

// Instance method to check if OTP is still valid
otpTokenSchema.methods.isValid = function() {
  return !this.used && !this.isExpired() && this.attempts < 5;
};

// Instance method to increment attempts
otpTokenSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to mark as used
otpTokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// ====================
// STATIC METHODS
// ====================

// Static method to find valid OTP
otpTokenSchema.statics.findValidOTP = function(email, hashedOTP, purpose) {
  return this.findOne({
    email: email.toLowerCase().trim(),
    hashedOTP,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
};

// Static method to cleanup expired tokens
otpTokenSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to cleanup old used tokens
otpTokenSchema.statics.cleanupUsed = function(olderThanHours = 24) {
  const cutoffDate = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
  return this.deleteMany({
    used: true,
    usedAt: { $lt: cutoffDate }
  });
};

// Static method to get user's recent OTP requests
otpTokenSchema.statics.getRecentRequests = function(userId, purpose, minutesBack = 5) {
  const cutoffDate = new Date(Date.now() - (minutesBack * 60 * 1000));
  return this.find({
    userId,
    purpose,
    createdAt: { $gt: cutoffDate }
  }).sort({ createdAt: -1 });
};

// ====================
// MIDDLEWARE
// ====================

// Pre-save middleware to update the updatedAt field
otpTokenSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Pre-save middleware to validate expiry date
otpTokenSchema.pre('save', function(next) {
  if (this.expiresAt <= new Date()) {
    return next(new Error('OTP expiry date must be in the future'));
  }
  next();
});

// ====================
// VIRTUAL FIELDS
// ====================

// Virtual field to get time remaining until expiry
otpTokenSchema.virtual('timeRemaining').get(function() {
  const now = Date.now();
  const expiry = this.expiresAt.getTime();
  return Math.max(0, expiry - now);
});

// Virtual field to get time remaining in minutes
otpTokenSchema.virtual('minutesRemaining').get(function() {
  return Math.floor(this.timeRemaining / (1000 * 60));
});

// Virtual field to check if recently created (within last minute)
otpTokenSchema.virtual('isRecentlyCreated').get(function() {
  const oneMinuteAgo = Date.now() - (60 * 1000);
  return this.createdAt.getTime() > oneMinuteAgo;
});

// ====================
// EXPORT MODEL
// ====================
module.exports = db.model("otp_tokens", otpTokenSchema)