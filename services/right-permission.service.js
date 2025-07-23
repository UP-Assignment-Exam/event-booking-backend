const Right = require("../models/Rights.model");

const rightsSeedData = [
    // Dashboard
    { group: 'Dashboard', name: 'dashboard:view', description: 'View dashboard metrics and charts' },

    // EvenE
    { group: 'Event', name: 'event:create', description: 'Create new events' },
    { group: 'Event', name: 'event:update', description: 'Update event details' },
    { group: 'Event', name: 'event:view', description: 'View event information' },
    { group: 'Event', name: 'event:delete', description: 'Delete events' },

    // Category
    { group: 'Category', name: 'category:create', description: 'Create new categories' },
    { group: 'Category', name: 'category:update', description: 'Update categories' },
    { group: 'Category', name: 'category:view', description: 'View categories' },
    { group: 'Category', name: 'category:delete', description: 'Delete categories' },

    // Payment Method
    { group: 'Payment Method', name: 'payment-method:create', description: 'Create payment methods' },
    { group: 'Payment Method', name: 'payment-method:update', description: 'Update payment methods' },
    { group: 'Payment Method', name: 'payment-method:view', description: 'View payment methods' },
    { group: 'Payment Method', name: 'payment-method:delete', description: 'Delete payment methods' },

    // Ticket Type
    { group: 'Ticket Type', name: 'ticket-type:create', description: 'Create ticket types' },
    { group: 'Ticket Type', name: 'ticket-type:update', description: 'Update ticket types' },
    { group: 'Ticket Type', name: 'ticket-type:view', description: 'View ticket types' },
    { group: 'Ticket Type', name: 'ticket-type:delete', description: 'Delete ticket types' },

    // Sale Ticket
    { group: 'Sale Ticket', name: 'sale-ticket:view', description: 'View sold tickets' },

    // Scan Ticket
    { group: 'Scan Ticket', name: 'scan-ticket:validate', description: 'Scan and validate tickets' },

    // User
    { group: 'User', name: 'user:create', description: 'Create user accounts' },
    { group: 'User', name: 'user:update', description: 'Update user accounts' },
    { group: 'User', name: 'user:view', description: 'View user accounts' },
    { group: 'User', name: 'user:delete', description: 'Delete user accounts' },

    // Role
    { group: 'Role', name: 'role:create', description: 'Create roles' },
    { group: 'Role', name: 'role:update', description: 'Update roles' },
    { group: 'Role', name: 'role:view', description: 'View roles' },
    { group: 'Role', name: 'role:delete', description: 'Delete roles' },

    // Right
    { group: 'Right', name: 'right:view', description: 'View rights and permissions' },

    // // Permission
    // { group: 'Permission', name: 'permission:view', description: 'View role permissions' },
    // { group: 'Permission', name: 'permission:assign', description: 'Assign rights to roles' },

    // Organization
    { group: 'Organization', name: 'organization:view', description: 'View organizations' },
    { group: 'Organization', name: 'organization:update', description: 'Update organization status' },

    // Request
    { group: 'Request', name: 'request:view', description: 'View organization requests' },
    { group: 'Request', name: 'request:approve', description: 'Approve organization requests' },
    { group: 'Request', name: 'request:reject', description: 'Reject organization requests' },
];


const initRights = async () => {
    try {
        const existingRight = await Right.findOne({}).catch(error => { throw error });
        if (existingRight) {
            console.log(`Right already exists. Skipping initialization.`);
            return;
        }

        return await Right.create(rightsSeedData);
    } catch (error) {
        console.error(`Error initializing right:`, error);
        throw error;
    }
}

module.exports = {
    initRights
};