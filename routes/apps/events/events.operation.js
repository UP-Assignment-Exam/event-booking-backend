const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Events = require("../../../models/Events.model");

const list = async (req, res) => {
  try {
    const { keyword, organization, dateRangeType, startDate, endDate, category, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "startDate");
    dbUtil.setLikeOrIfNotEmpty(query, ["title", "description"], keyword);
    dbUtil.setIfNotEmpty(query, "organization", organization, "objectId");
    dbUtil.setIfNotEmpty(query, "category", category, "objectId");

    const count = await Events.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Events.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize));

    return util.ResListSuss(req, res, rsp, count);
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
  list,
  getOne
}