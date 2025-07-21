const { db, mongoose } = require("./settings/connection")

const RoleSchema = mongoose.Schema(
    {
        type: { type: String, enum: ["website", "app"], default: "website" },
        name: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        superAdmin: {
            type: Boolean,
            default: false,
            required: [true, "Super Admin must not be null"],
        },
        organizationSuperAdmin: {
            type: Boolean,
            default: false,
            required: [true, "Organization Super Admin must not be null"],
        },
        associatedRights: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "rights",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("roles", RoleSchema)
