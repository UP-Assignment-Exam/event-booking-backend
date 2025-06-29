const { db, mongoose } = require("./settings/connection");

const SetupPasswordTokenSchema = mongoose.Schema(
  {
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_users",
      required: [true, "Admin user ID must not be null"],
    },
    token: {
      type: String,
      required: [true, "Token must not be null"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24, // 1 day in seconds
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = db.model("admin_user_requests", SetupPasswordTokenSchema);
