const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Events = require("../../../models/Events.model");

const create = async (req, res) => {
  try {
    const { title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate } = req.body;

    const upData = { title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate, createdBy: req.user._id, isDeleted: false };

    if (req.user.organization) {
      upData.organization = req.user.organization;
    }

    const rsp = await new Events(upData).save();

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Event creation failed");
    }

    return util.ResSuss(req, res, {}, "Event created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, organization, dateRangeType, startDate, endDate, category, createdBy, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "startDate");
    dbUtil.setLikeOrIfNotEmpty(query, ["title", "description"], keyword);
    dbUtil.setIfNotEmpty(query, "organization", organization, "objectId");
    dbUtil.setIfNotEmpty(query, "createdBy", createdBy, "objectId");
    dbUtil.setIfNotEmpty(query, "category", category, "objectId");

    const count = await Events.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Events.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("createdBy", "username firstName lastName");

    return util.ResListSuss(req, res, rsp, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate } = req.body;

    const upData = { title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate };

    if (req.user.organization) {
      upData.organization = req.user.organization;
    }

    const rsp = await Events.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: upData }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Event not found");
    }

    return util.ResSuss(req, res, rsp, "Event updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const destory = async (req, res) => {
  try {
    const { id } = req.params;

    const rsp = await Events.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Event not found");
    }

    return util.ResSuss(req, res, rsp, "Event deleted successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const getOne = async (req, res) => {
  try {
    const id = req.params;

    const query = {
      _id: util.objectId(id),
      isDeleted: { $ne: true },
    };

    const rsp = await Events.findOne(query)
      .populate("organization", "name type logoUrl")
      .populate("category", "name color iconUrl")
      .populate({
        path: "ticketTypes.ticketTypeId",
        select: "title description"
      })

    return util.ResSuss(req, res, rsp);
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
  getOne
}