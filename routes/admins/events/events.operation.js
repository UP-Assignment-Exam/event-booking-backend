const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Events = require("../../../models/Events.model");

const getStatic = async (req, res) => {
  try {
    const now = new Date();

    const rsp = await Events.aggregate([
      { $match: { isDeleted: false } }, // Exclude deleted events

      {
        $facet: {
          totalEvents: [{ $count: "count" }],

          activeEvents: [
            { $match: { endDate: { $gte: now } } },
            { $count: "count" }
          ],

          purchasableEvents: [
            { $match: { isPurchasable: true } },
            { $count: "count" }
          ],

          ticketStats: [
            { $unwind: "$ticketTypes" },
            {
              $group: {
                _id: null,
                totalTicketsSold: { $sum: "$ticketTypes.soldQuantity" },
                totalRevenue: {
                  $sum: {
                    $multiply: ["$ticketTypes.soldQuantity", "$ticketTypes.price"]
                  }
                }
              }
            }
          ],

          hotEvents: [
            { $unwind: "$ticketTypes" },
            {
              $group: {
                _id: "$_id",
                totalSold: { $sum: "$ticketTypes.soldQuantity" }
              }
            },
            { $match: { totalSold: { $gt: 1000 } } }, // define "hot" threshold here
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = rsp[0];

    const stats = {
      total: result.totalEvents[0]?.count || 0,
      active: result.activeEvents[0]?.count || 0,
      // active: result.activeEvents[0]?.count || 0,
      purchasable: result.purchasableEvents[0]?.count || 0,
      totalTicketsSold: result.ticketStats[0]?.totalTicketsSold || 0,
      totalRevenue: result.ticketStats[0]?.totalRevenue || 0,
      hotEvents: result.hotEvents[0]?.count || 0,
    }

    return util.ResSuss(req, res, stats, "Static data fetched successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const create = async (req, res) => {
  try {
    const { imageUrl, location, title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate } = req.body;

    const upData = { imageUrl, location, title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate, createdBy: req.user._id, isDeleted: false };

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
    const { keyword, isPurchasable, organization, dateRangeType, startDate, endDate, category, createdBy, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "startDate");
    dbUtil.setLikeOrIfNotEmpty(query, ["title", "description"], keyword);
    dbUtil.setIfNotEmpty(query, "isPurchasable", isPurchasable, { skipValue: "all", type: "boolean" });
    dbUtil.setIfNotEmpty(query, "organization", organization, { skipValue: "all", type: "objectId" });
    dbUtil.setIfNotEmpty(query, "createdBy", createdBy, { skipValue: "all", type: "objectId" });
    dbUtil.setIfNotEmpty(query, "category", category, { skipValue: "all", type: "objectId" });

    const count = await Events.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Events.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("ticketTypes.ticketTypeId", "title imageUrl")
      .populate("organization", "name type")
      .populate("category", "title iconUrl")
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
    const { imageUrl, location, title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate } = req.body;

    const upData = { imageUrl, location, title, description, organization, category, ticketTypes, isPurchasable, disabledPurchase, startDate, endDate };

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

const updatePurchase = async (req, res) => {
  try {
    const id = req.params.id;
    const { isPurchasable } = req.bodyl

    await Events.findOneAndUpdate(
      { _id: dbUtil.objectId(id) },
      { $set: { isPurchasable: isPurchasable } }
    );

    return util.ResSuss(req, res, {}, "Event updated successfully");
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
  getOne,
  getStatic,
  updatePurchase
}