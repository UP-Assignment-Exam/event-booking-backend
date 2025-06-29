const { db, mongoose } = require("./settings/connection")

const RightSchema = mongoose.Schema(
    {
        type: { type: String, enum: ["website", "app"], default: "website" },
        name: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description must not be null"],
            trim: true,
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("rights", RightSchema)
