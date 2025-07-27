require('dotenv').config({ path: "../.env" });
const mongoose = require('mongoose');
const User = require('../models/AdminUsers.model');
const Role = require('../models/Roles.model');
const bcrypt = require('bcryptjs');

async function seedRoles() {
    try {
        const checkExist = await Role.findOne({ level: "System Admin", name: "Admin" });
        if (checkExist) {
            console.log("Role exists!");
            return checkExist;
        }

        await Role({
            name: "Organization Admin",
            type: "website",
            associatedRights: [],
            organizationSuperAdmin: true,
        }).save();

        return await Role({
            name: "Super Admin",
            type: "website",
            associatedRights: [],
            superAdmin: true,
        }).save();
    } catch (error) {
        console.error('Error seeding roles:', error);
    }
}
async function seedAdmin() {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const role = await seedRoles();
        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const saltRounds = 12;

        const hashedPassword = await bcrypt.hash("Admin@123", saltRounds);

        const adminUser = new User({
            username: "Damon Kert",
            firstName: "Damon",
            lastName: "Kert",
            email: 'admin@gmail.com',
            phone: "012345231",
            password: hashedPassword,
            role: role?._id,
        });

        await adminUser.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedAdmin();
