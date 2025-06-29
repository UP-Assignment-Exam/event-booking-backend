const { db, mongoose } = require("./settings/connection")

const EventSchema = mongoose.Schema(
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
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            required: [true, "Category must not be null"],
        },
        ticketTypes: [
            {
                name: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "ticket_types",
                },
                price: {
                    type: Number,
                    required: [true, "Price must not be null"],
                    min: [0, "Price must be a positive number"],
                },
                quantity: {
                    type: Number,
                    required: [true, "Total tickets must not be null"],
                    min: [1, "Total tickets must be at least 1"],
                },
                soldQuantity: {
                    type: Number,
                    default: 0,
                    min: [0, "Total sold ticket cannot be negative"],
                }
            }
        ],
        isPurchasable: {
            type: Boolean,
            default: false,
        },
        disabledPurchase: {
            unit: {
                type: String,
                enum: ["minute", "hour", "day", "week", "month", "year"],
                default: "day",
            },
            value: {
                type: Number,
                default: 0,
                min: [0, "Disabled purchase value cannot be negative"],
            },
        },
        startDate: {
            type: Date,
            required: [true, "Start date must not be null"],
        },
        endDate: {
            type: Date,
            required: [true, "End date must not be null"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("events", EventSchema)
