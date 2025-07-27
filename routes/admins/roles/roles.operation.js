const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Roles = require("../../../models/Roles.model");

const checkDuplicate = async (req, { name, type }, query = {}) => {
  const roleExists = await Roles.findOne({
    ...query,
    name: name,
    type: type || "website",
    isDeleted: { $ne: true },
    organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false }
  });

  if (util.notEmpty(roleExists)) {
    throw Error("Role with this name already exists");
  }
}

const create = async (req, res) => {
  try {
    const { type, name, description, associatedRights } = req.body;

    await checkDuplicate(req, { name, type });

    const upData = {
      createdBy: req.user._id,
      isDeleted: false,
    };

    if (util.notEmpty(req.user?.organization)) {
      upData.organization = dbUtil.objectId(req.user.organization)
    }

    const rsp = await Roles.updateOne({
      type: type || "website",
      name: name,
      organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false },
      description,
      associatedRights
    }, { $set: upData }, { upsert: true });

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Role creation failed");
    }

    return util.ResSuss(req, res, {}, "Role created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, type, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);

    if (util.notEmpty(req.user?.organization)) {
      query.organization = dbUtil.objectId(req.user?.organization);
    } else {
      query.organization = { $exists: false };
      dbUtil.setIfNotEmpty(query, "type", type);
    }

    const count = await Roles.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const roles = await Roles.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("userCount")
      .populate("createdBy", "username firstName lastName");

    return util.ResListSuss(req, res, roles, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Roles.updateOne(
      { _id: util.objectId(id) },
      { $set: { status: status } }
    )

    return util.ResSuss(req, res, {});
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, associatedRights, description } = req.body;

    await checkDuplicate(req, { name, type }, { _id: { $ne: dbUtil.objectId(id) } });

    const query = {
      _id: dbUtil.objectId(id),
      isDeleted: { $ne: true },
      superAdmin: { $ne: true }
    }

    if (util.notEmpty(req.user?.organization)) {
      query.organization = dbUtil.objectId(req.user?.organization);
    } else {
      query.organization = { $exists: false };
    }

    const role = await Roles.findOneAndUpdate(
      query,
      {
        $set: {
          name,
          type,
          description,
          associatedRights,
          updatedBy: req.user?._id
        }
      },
      { new: true }
    );

    if (util.isEmpty(role)) {
      return util.ResFail(req, res, "Role not found");
    }

    return util.ResSuss(req, res, role, "Role updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const destory = async (req, res) => {
  try {
    const { id } = req.params;

    const query = {
      _id: dbUtil.objectId(id),
      isDeleted: { $ne: true },
      superAdmin: { $ne: true }
    }

    if (util.notEmpty(req.user?.organization)) {
      query.organization = dbUtil.objectId(req.user?.organization);
    } else {
      query.organization = { $exists: false };
    }

    const role = await Roles.findOneAndUpdate(
      query,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (util.isEmpty(role)) {
      return util.ResFail(req, res, "Role not found");
    }

    return util.ResSuss(req, res, role, "Role deleted successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  create,
  list,
  update,
  destory,
  updateStatus
}