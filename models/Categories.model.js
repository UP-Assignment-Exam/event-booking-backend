const { db, mongoose } = require("./settings/connection")

const CategoriesSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        color: {
            type: String,
            required: [true, "Color must not be null"],
            trim: true,
        },
        iconUrl: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Created by must not be null"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("categories", CategoriesSchema)
