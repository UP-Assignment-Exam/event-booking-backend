const { db, mongoose } = require("./settings/connection")
const validator = require("validator")

const AdminSchema = mongoose.Schema(
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
        password: { type: String, trim: true },
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
        passwordChangedAt: Date,
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "roles",
        },
        isSetup: {
            type: Boolean,
            default: false
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("admin_users", AdminSchema)
