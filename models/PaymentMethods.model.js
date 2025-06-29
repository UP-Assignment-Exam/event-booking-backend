const { db, mongoose } = require("./settings/connection")

const PaymentMethodSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name must not be null"],
            trim: true,
        },
        type: {
            type: String,
            enum: ["card", "bank_transfer", "cash"],
            required: [true, "Type must not be null"],
        },
        description: {
            type: String,
            required: [true, "Description must not be null"],
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL must not be null"],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("payment_methods", PaymentMethodSchema)
