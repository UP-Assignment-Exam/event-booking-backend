const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
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
    const { type, name } = req.body;

    await checkDuplicate(req, { name, type });

    const upData = {
      associatedRights: [],
      createdBy: req.user._id,
      isDeleted: false,
    };

    if (util.notEmpty(req.user?.organization)) {
      upData.organization = dbUtil.objectId(req.user.organization)
    }

    const rsp = await Roles.updateOne({
      type: type || "website",
      name: name,
      organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false }
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
      .populate("associatedRights", "name description");

    return util.ResListSuss(req, res, roles, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, associatedRights } = req.body;

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
          associatedRights
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
  destory
}