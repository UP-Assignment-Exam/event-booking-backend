const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
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

const getStatic = async (req, res) => {
  try {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const rsp = await PromoCodes.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { status: "active" } }, { $count: "count" }],
          expired: [{ $match: { status: "expired" } }, { $count: "count" }],
          expiringSoon: [
            {
              $match: {
                status: "active", // Usually only active codes are considered for "expiring soon"
                endDate: { $gte: today, $lte: next7Days },
              }
            },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ["$total.count", 0] },
          active: { $arrayElemAt: ["$active.count", 0] },
          expired: { $arrayElemAt: ["$expired.count", 0] },
          expiringSoon: { $arrayElemAt: ["$expiringSoon.count", 0] },
        }
      }
    ]);


    const result = rsp[0] || {};

    const stats = {
      total: result.total || 0,
      active: result.active || 0,
      expired: result.expired || 0,
      expiringSoon: result.expiringSoon || 0,
    };

    return util.ResSuss(req, res, stats, "Static data fetched successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const create = async (req, res) => {
  try {
    const { promoCode, title, description, discountType, discountValue, minOrder, maxUses, status, priority, startDate, endDate } = req.body;

    await checkDuplicate(req, { promoCode });

    const upData = { promoCode, title, description, discountType, discountValue, minOrder, maxUses, status, priority, startDate, endDate, createdBy: req.user._id, isDeleted: false };

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
    const { keyword, discountType, status, isActive, startDate, endDate, dateRangeType, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setQueryBetweenDate(query, startDate, endDate, dateRangeType || "expirdAt");
    dbUtil.setLikeOrIfNotEmpty(query, ["title", "promoCode", "description"], keyword);
    dbUtil.setIfNotEmpty(query, "isActive", isActive);
    dbUtil.setIfNotEmpty(query, "status", status, { skipValue: "all" })
    dbUtil.setIfNotEmpty(query, "discountType", discountType, { skipValue: "all" })

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
    const { promoCode, title, description, discountType, discountValue, minOrder, maxUses, status, priority, startDate, endDate } = req.body;

    await checkDuplicate(req, { promoCode }, { _id: { $ne: dbUtil.objectId(id) } });

    const rsp = await PromoCodes.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
        currentUses: { $eq: 0 }
      },
      {
        $set: {
          promoCode, title, description,
          discountType, discountValue, minOrder,
          maxUses, status, priority,
          startDate, endDate, updatedBy: req?.user?._id
        }
      },
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

const deleteExpired = async (req, res) => {
  try {
    const now = new Date();

    const result = await PromoCodes.updateMany(
      {
        endDate: { $lt: now },
        isDeleted: { $ne: true } // avoid updating already-deleted ones
      },
      {
        $set: { isDeleted: true }
      }
    );

    return util.ResSuss(req, res, { message: "Expired promo codes deleted", result });
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
};

module.exports = {
  create,
  list,
  update,
  destory,
  generate,
  getStatic,
  deleteExpired
}