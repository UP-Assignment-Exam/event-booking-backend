const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const TicketTypes = require("../../../models/TicketType.model");

const checkDuplicate = async (req, { title }, query = {}) => {
  const ticketTypesExists = await TicketTypes.findOne({
    ...query,
    title: title,
    isDeleted: { $ne: true },
    organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false }
  });

  if (util.notEmpty(ticketTypesExists)) {
    throw Error("Ticket Type with this title already exists");
  }
}

const create = async (req, res) => {
  try {
    const { title, description, imageUrl, isActive } = req.body;

    await checkDuplicate(req, { title });

    const rsp = await TicketTypes.updateOne({
      title: title,
      userId: req.user._id,
      organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false }
    }, {
      $set: {
        title: title,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id,
        isActive: isActive,
        isDeleted: false,
      }
    }, { upsert: true });

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Ticket Type creation failed");
    }

    return util.ResSuss(req, res, {}, "Ticket Type created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, userId, organization, isActive, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setIfNotEmpty(query, "isActive", isActive);
    dbUtil.setIfNotEmpty(query, "userId", userId);
    
    if (req.user?.role?.superAdmin) {
      dbUtil.setIfNotEmpty(query, "organization", organization);
    } else {
      dbUtil.setIfNotEmpty(query, "organization", req.user?.organization);
    }

    dbUtil.setLikeOrIfNotEmpty(query, ["title"], keyword);

    const count = await TicketTypes.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await TicketTypes.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("userId", "username firstName lastName");

    return util.ResListSuss(req, res, rsp, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, isActive } = req.body;

    await checkDuplicate(req, { title }, { _id: { $ne: dbUtil.objectId(id) } });

    const role = await TicketTypes.findOneAndUpdate(
      { _id: dbUtil.objectId(id), isDeleted: { $ne: true }, organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false } },
      { $set: { title, description, imageUrl, isActive } },
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

    const role = await TicketTypes.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
        organization: req.user?.organization ? dbUtil.objectId(req.user.organization) : { $exists: false }
      },
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