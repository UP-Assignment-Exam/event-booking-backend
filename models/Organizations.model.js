const { db, mongoose } = require("./settings/connection")

const OrganizationSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: { // Add Managment maybe
            type: String,
            enum: ['company', 'non-profit', 'government', 'school', 'other'],
            default: 'company',
        },
        industry: String, // Add Managment maybe
        bio: String,
        email: String,
        phone: String,
        website: String,
        logoUrl: String,
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin_users',
        },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = db.model("organizations", OrganizationSchema)