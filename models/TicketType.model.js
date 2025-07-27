const { db, mongoose } = require("./settings/connection")

const TicketTypeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description must not be null"],
            trim: true,
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL must not be null"],
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Create by must not be null"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // organization: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "organizations",
        // },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("ticket_types", TicketTypeSchema)
