const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const AdminUserRequests = require("../../../models/AdminUserRequests.model");
const Organization = require("../../../models/Organizations.model");
const AdminUser = require("../../../models/AdminUsers.model");
const RolesService = require("../../../services/roles.service");

const getStatic = async (req, res) => {
  try {
    const rsp = await AdminUserRequests.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: { k: "$_id", v: "$count" },
          },
          total: { $sum: "$count" }
        }
      },
      {
        $project: {
          data: {
            $concatArrays: [
              "$data",
              [{ k: "total", v: "$total" }]
            ]
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: "$data" }
        }
      }
    ]);


    if (util.isEmpty(rsp)) {
      return util.ResSuss(req, res, { total: 0, pending: 0, approved: 0, rejected: 0 }, "No data found");
    }

    return util.ResSuss(req, res, rsp[0], "Static data fetched successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, organizationCategory, status, pageNo, pageSize } = req.query;

    const query = {};

    dbUtil.setIfNotEmpty(query, "status", status, { skipValue: "all" });
    dbUtil.setIfNotEmpty(query, "organizationCategory", organizationCategory, { skipValue: "all" });
    dbUtil.setLikeOrIfNotEmpty(query, ["contactName", "organizationName", "email", "phone"], keyword);

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
    const { status, reason } = req.body;

    const rsp = await AdminUserRequests.findOneAndUpdate(
      { _id: dbUtil.objectId(id), status: "pending" },
      { $set: { status, actionReason: reason } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Request not found or already processed");
    }

    if (status === "approved") {
      const organizationSuperAdminRole = await RolesService.getOrganizationSuperAdmin();

      const organization = await new Organization(
        {
          name: rsp.organizationName,
          type: rsp.organizationCategory,
          contactInfo: rsp.contactName,
          email: rsp.email,
          phone: rsp.phone,
          bio: rsp.description,
          website: rsp.website,
          industry: rsp.industry,
          adminUserRequest: rsp._id,
          createdBy: rsp.user?._id,
        }
      ).save();

      const adminUser = await new AdminUser(
        {
          username: rsp.contactName,
          firstName: rsp.lastName,
          lastName: rsp.firstName,
          phone: rsp.phone,
          email: rsp.email,
          organization: organization?._id,
          role: organizationSuperAdminRole?._id,
        }
      ).save();

      if (util.notEmpty(adminUser)) {
        // TODO: Send Email to setup password
      }
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
  getStatic
}