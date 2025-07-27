const { db, mongoose } = require("./settings/connection");

const PaymentMethodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name must not be null"],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, "Provider must not be null"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["card", "bank", "wallet", "crypto", "qr"],
      required: [true, "Type must not be null"],
    },
    processingFee: {
      type: Number,
      required: [true, "Processing fee must not be null"],
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: [true, "Description must not be null"],
      trim: true,
    },
    apiKey: {
      type: String,
      trim: true,
    },
    supportedCurrencies: {
      type: [String], // e.g., ["USD", "EUR", "GBP"]
      required: [true, "Supported currencies must not be null"],
    },
    webhookUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin_users',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin_users',
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin_users',
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = db.model("payment_methods", PaymentMethodSchema);