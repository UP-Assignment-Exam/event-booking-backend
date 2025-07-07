const Roles = require("../models/Roles.model");
const util = require("../exports/util");

const getOrganizationSuperAdmin = async () => {
    const superAdminRole = await Roles.findOne({
        organizationSuperAdmin: true
    });

    if (util.notEmpty(superAdminRole)) {
        return superAdminRole;
    }

    const role = new Roles({
        type: "website",
        name: "Organization Super Admin",
        organizationSuperAdmin: true,
        associatedRights: [],
        createdBy: null,
    })

    await role.save();

    return role;
}

module.exports = {
    getOrganizationSuperAdmin
}