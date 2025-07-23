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
            enum: ['Company', 'Non-Profit', 'Government', 'School', 'Other'],
            default: 'Company',
        },
        industry: String, // Add Managment maybe
        bio: String,
        contactInfo: String,
        email: String,
        phone: String,
        website: String,
        logoUrl: String,
        adminUserRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin_user_requests',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin_users',
        },
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

OrganizationSchema.virtual("memberCount", {
    ref: "admin_users",
    localField: "_id",
    foreignField: "organization",
    count: true,
})

module.exports = db.model("organizations", OrganizationSchema)