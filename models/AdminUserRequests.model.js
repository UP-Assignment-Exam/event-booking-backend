const { db, mongoose } = require("./settings/connection")
const validator = require("validator")

const AdminUserRequestSchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    username: {
      type: String,
      required: [true, "Username must not be null"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "Username must not be null"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Username must not be null"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number must not be null"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email must not be null"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid email format",
      },
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_users",
    },
    actionAt: {
      type: Date,
    },
    actionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("admin_user_requests", AdminUserRequestSchema)