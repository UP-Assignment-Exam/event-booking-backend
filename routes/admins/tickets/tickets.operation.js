const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Tickets = require("../../../models/Tickets.model");

const create = async (req, res) => {
  try {
    const {
      userId, eventId, price,
      quantity, totalPrice, status,
      ticketType, paymentMethod, discount,
      promoCode
    } = req.body;

    const upData = {
      userId, eventId, price,
      quantity, totalPrice, status,
      ticketType, paymentMethod,
      discount: {
        setBy: req.user?._id,
        percentage: discount,
        promoCode: promoCode,
      },
      createdBy: req.user._id,
    };

    const rsp = await new Tickets(upData).save();

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Tickets creation failed");
    }

    return util.ResSuss(req, res, {}, "Tickets created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
   const {
      userId, eventId, price,
      quantity, totalPrice, status,
      ticketType, paymentMethod,
      promoCode
    } = req.body;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "startDate");
    dbUtil.setLikeOrIfNotEmpty(query, ["title", "description"], keyword);
    dbUtil.setIfNotEmpty(query, "userId", userId, "objectId");
    dbUtil.setIfNotEmpty(query, "eventId", eventId, "objectId");
    dbUtil.setIfNotEmpty(query, "price", price);
    dbUtil.setIfNotEmpty(query, "quantity", quantity);
    dbUtil.setIfNotEmpty(query, "totalPrice", totalPrice);
    dbUtil.setIfNotEmpty(query, "status", status);
    dbUtil.setIfNotEmpty(query, "ticketType", ticketType, "objectId");
    dbUtil.setIfNotEmpty(query, "paymentMethod", paymentMethod, "objectId");
    dbUtil.setIfNotEmpty(query, "discount.promoCode", promoCode, "objectId");

    const count = await Tickets.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Tickets.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("eventId", "title description")
      .populate("discount.promoCode", "promoCode imageUrl color")
      .populate("ticketType", "title")
      .populate("paymentMethod", "name type imageUrl")
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
    const {
      status,  paymentMethod, discount,
      promoCode
    } = req.body;

    const upData = {
      status, paymentMethod,
      discount: {
        setBy: req.user?._id,
        percentage: discount,
        promoCode: promoCode,
      },
    };

    const rsp = await Tickets.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: upData }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Ticket not found");
    }

    return util.ResSuss(req, res, rsp, "Ticket updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  create,
  list,
  update
}