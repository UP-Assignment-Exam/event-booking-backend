const { db, mongoose } = require("./settings/connection")

const TicketSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "app_users",
            required: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events",
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        ticketType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ticket_types",
        },
        paymentMethod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "payment_methods",
        },
        discount: {
            setBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "admin_users",
            },
            percentage: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            promoCode: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "promo_codes",
            },
        },
        purchasedAt: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users"
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("tickets", TicketSchema)
