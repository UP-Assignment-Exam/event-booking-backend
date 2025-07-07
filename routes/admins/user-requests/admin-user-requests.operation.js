const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const AdminUserRequests = require("../../../models/AdminUserRequests.model");
const Organization = require("../../../models/Organizations.model");
const AdminUser = require("../../../models/AdminUsers.model");
const RolesService = require("../../../services/roles.service");

const list = async (req, res) => {
  try {
    const { status, pageNo, pageSize } = req.query;

    const query = {};

    dbUtil.setIfNotEmpty(query, "status", status);

    const count = await AdminUserRequests.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const roles = await AdminUserRequests.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("actionBy", "username firstName lastName phone email");

    return util.ResListSuss(req, res, roles, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const rsp = await AdminUserRequests.findOneAndUpdate(
      { _id: dbUtil.objectId(id), status: "pending" },
      { $set: { status } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Request not found or already processed");
    }

    const organizationSuperAdminRole = await RolesService.getOrganizationSuperAdmin();

    const organization = await new Organization(
      {
        name: rsp.organizationName,
        type: rsp.organizationType,
        email: rsp.email,
        phone: rsp.phone,
      }
    ).save();

    const adminUser = await new AdminUser([
      {
        username: rsp.username,
        firstName: rsp.lastName,
        lastName: rsp.firstName,
        phone: rsp.phone,
        email: rsp.email,
        organization: organization?._id,
        role: organizationSuperAdminRole?._id,
      }
    ]).save();

    if (util.notEmpty(adminUser)) {
      // TODO: Send Email to setup password
    }

    return util.ResSuss(req, res, rsp, "Request updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  list,
  update,
}