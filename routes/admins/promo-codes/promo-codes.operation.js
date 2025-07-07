const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const PromoCodes = require("../../../models/PromoCode.model");
const PromoCodesService = require("../../../services/promo-codes.service");

const checkDuplicate = async (req, { promoCode }, query = {}) => {
  const promoCodeExists = await PromoCodes.findOne({
    ...query,
    promoCode: dbUtil.getLike(promoCode),
    isDeleted: { $ne: true },
  });

  if (util.notEmpty(promoCodeExists)) {
    throw Error("Promo Code with this name already exists");
  }
}

const create = async (req, res) => {
  try {
    const { promoCode, discountPercentage, color, imageUrl, startAt, expirdAt, isActive } = req.body;

    await checkDuplicate(req, { promoCode });

    const upData = { promoCode, discountPercentage, color, imageUrl, startAt, expirdAt, isActive, createdBy: req.user._id, isDeleted: false };

    const rsp = await PromoCodes.updateOne(
      { promoCode: promoCode },
      { $set: upData },
      { upsert: true }
    );

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Promo Code creation failed");
    }

    return util.ResSuss(req, res, {}, "Promo Code created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, isActive, startDate, endDate, dateRangeType, bindedCategories, bindedEvents, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "expirdAt");
    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);
    dbUtil.setIfNotEmpty(query, "isActive", isActive);
    dbUtil.setIfNotEmpty(query, "bindedCategories", bindedCategories, "objectId");
    dbUtil.setIfNotEmpty(query, "bindedEvents", bindedEvents, "objectId");

    const count = await PromoCodes.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const roles = await PromoCodes.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("createdBy", "username firstName lastName");

    return util.ResListSuss(req, res, roles, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { promoCode, discountPercentage, color, imageUrl, startAt, expirdAt, isActive } = req.body;

    await checkDuplicate(req, { promoCode }, { _id: { $ne: dbUtil.objectId(id) } });

    const rsp = await PromoCodes.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { promoCode, discountPercentage, color, imageUrl, startAt, expirdAt, isActive } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Promo Code not found");
    }

    return util.ResSuss(req, res, rsp, "Promo Code updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const destory = async (req, res) => {
  try {
    const { id } = req.params;

    const rsp = await PromoCodes.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Promo Code not found");
    }

    return util.ResSuss(req, res, rsp, "Promo Code deleted successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const generate = async (req, res) => {
  try {
    const { prefix } = req.body;

    if (util.isEmpty(prefix)) {
      return util.ResFail(req, res, "Prefix is required");
    }

    const promoCode = await PromoCodesService.generateUniquePromoCodeWithPrefix(prefix);

    return util.ResSuss(req, res, { promoCode }, "Promo code generated successfully");
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
  generate
}