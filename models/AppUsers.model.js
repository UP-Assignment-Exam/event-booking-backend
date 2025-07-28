const { db, mongoose } = require("./settings/connection")
const validator = require("validator")

const AppSchema = mongoose.Schema(
    {
        isDeleted: { type: Boolean, default: false },
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
        phone: String,
        password: { type: String, trim: true },
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
        lastLogoutAt: Date,
        isActive: Boolean,
        emailVerified: Boolean,
        avatar: String,
        passwordChangedAt: Date,
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("app_users", AppSchema)
