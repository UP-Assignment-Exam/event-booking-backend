const AdminUsers = require("../models/AdminUsers.model");
const util = require("../exports/util");

const getPublicUser = async (userId) => {
    return await AdminUsers.findOne(
        { _id: util.objectId(userId) },
        "-password"
    ).populate("role", "name superAdmin organizationSuperAdmin associatedRights")
}

module.exports = {
    getPublicUser
};