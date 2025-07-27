const { db, mongoose } = require("./settings/connection")

const PromoCodeSchema = mongoose.Schema(
    {
        promoCode: { type: String, required: true, uppercase: true, unique: true },
        title: { type: String, required: true },
        description: { type: String },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        minOrder: { type: Number, required: true },
        maxUses: { type: Number, required: true },
        currentUses: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Created by must not be null"],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_users",
            required: [true, "Updated by must not be null"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = db.model("promo_codes", PromoCodeSchema)