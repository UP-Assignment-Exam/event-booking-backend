const Right = require("../models/Rights.model");

const rightsSeedData = [
    // Dashboard
    { group: 'dashboard', group: 'dashboard', name: 'dashboard:view', description: 'View dashboard metrics and charts' },

    // Event
    { group: 'event', group: 'event', name: 'event:create', description: 'Create new events' },
    { group: 'event', group: 'event', name: 'event:update', description: 'Update event details' },
    { group: 'event', group: 'event', name: 'event:view', description: 'View event information' },
    { group: 'event', group: 'event', name: 'event:delete', description: 'Delete events' },

    // Category
    { group: 'category', group: 'category', name: 'category:create', description: 'Create new categories' },
    { group: 'category', group: 'category', name: 'category:update', description: 'Update categories' },
    { group: 'category', group: 'category', name: 'category:view', description: 'View categories' },
    { group: 'category', group: 'category', name: 'category:delete', description: 'Delete categories' },

    // Payment Method
    { group: 'payment-method', group: 'payment-method', name: 'payment-method:create', description: 'Create payment methods' },
    { group: 'payment-method', group: 'payment-method', name: 'payment-method:update', description: 'Update payment methods' },
    { group: 'payment-method', group: 'payment-method', name: 'payment-method:view', description: 'View payment methods' },
    { group: 'payment-method', group: 'payment-method', name: 'payment-method:delete', description: 'Delete payment methods' },

    // Ticket Type
    { group: 'ticket-type', group: 'ticket-type', name: 'ticket-type:create', description: 'Create ticket types' },
    { group: 'ticket-type', group: 'ticket-type', name: 'ticket-type:update', description: 'Update ticket types' },
    { group: 'ticket-type', group: 'ticket-type', name: 'ticket-type:view', description: 'View ticket types' },
    { group: 'ticket-type', group: 'ticket-type', name: 'ticket-type:delete', description: 'Delete ticket types' },

    // Sale Ticket
    { group: 'sale-ticket', group: 'sale-ticket', name: 'sale-ticket:view', description: 'View sold tickets' },

    // Scan Ticket
    { group: 'scan-ticket', group: 'scan-ticket', name: 'scan-ticket:validate', description: 'Scan and validate tickets' },

    // User
    { group: 'user', group: 'user', name: 'user:create', description: 'Create user accounts' },
    { group: 'user', group: 'user', name: 'user:update', description: 'Update user accounts' },
    { group: 'user', group: 'user', name: 'user:view', description: 'View user accounts' },
    { group: 'user', group: 'user', name: 'user:delete', description: 'Delete user accounts' },

    // Role
    { group: 'role', group: 'role', name: 'role:create', description: 'Create roles' },
    { group: 'role', group: 'role', name: 'role:update', description: 'Update roles' },
    { group: 'role', group: 'role', name: 'role:view', description: 'View roles' },
    { group: 'role', group: 'role', name: 'role:delete', description: 'Delete roles' },

    // Right
    { group: 'right', group: 'right', name: 'right:view', description: 'View rights and permissions' },

    // // Permission
    // { group: 'permission', group: 'permission', name: 'permission:view', description: 'View role permissions' },
    // { group: 'permission', group: 'permission', name: 'permission:assign', description: 'Assign rights to roles' },

    // Organization
    { group: 'organization', group: 'organization', name: 'organization:view', description: 'View organizations' },
    { group: 'organization', group: 'organization', name: 'organization:update', description: 'Update organization status' },

    // Request
    { group: 'request', group: 'request', name: 'request:view', description: 'View organization requests' },
    { group: 'request', group: 'request', name: 'request:approve', description: 'Approve organization requests' },
    { group: 'request', group: 'request', name: 'request:reject', description: 'Reject organization requests' },
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