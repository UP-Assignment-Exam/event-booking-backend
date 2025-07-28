const Users = require("../models/AppUsers.model");
const util = require("../exports/util");

const getPublicUser = async (userId) => {
    return await Users.findOne(
        { _id: util.objectId(userId) },
        "-password"
    )
}

module.exports = {
    getPublicUser
};