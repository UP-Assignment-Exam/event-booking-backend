const { db, mongoose } = require("./settings/connection")

const PromoCodeSchema = mongoose.Schema(
    {
        promoCode: {
            type: String,
            required: [true, "Promo Code must not be null"],
            trim: true,
        },
        discountPercentage: {
            type: Number,
            required: [true, "Discount percentage must not be null"],
            min: [0, "Discount percentage cannot be negative"],
            max: [100, "Discount percentage cannot exceed 100"],
        },
        color: {
            type: String,
            required: [true, "Color must not be null"],
            trim: true,
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        bindedEvents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "events",
            default: [],
        }],
        bindedCategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            default: [],
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Created by must not be null"],
        },
        startAt: {
            type: Date,
            required: [true, "Start date must not be null"],
        },
        expirdAt: {
            type: Date,
            required: [true, "Expiry date must not be null"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("promo_codes", PromoCodeSchema)
