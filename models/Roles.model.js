const { db, mongoose } = require("./settings/connection")

const RoleSchema = mongoose.Schema(
    {
        type: { type: String, enum: ["website", "app"], default: "website" },
        name: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        associatedRights: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "rights",
            },
        ],
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("roles", RoleSchema)
