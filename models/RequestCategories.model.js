const { db, mongoose } = require("./settings/connection")

const RequestCategoriesSchema = mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        name: {
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Created by must not be null"],
        },
        actionAt: {
            type: Date,
        },
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("request_categories", RequestCategoriesSchema)
