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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Created by must not be null"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("ticket_types", TicketTypeSchema)
