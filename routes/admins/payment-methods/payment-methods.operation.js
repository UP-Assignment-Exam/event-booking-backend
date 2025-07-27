const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const PaymentMethods = require("../../../models/PaymentMethods.model");

const getStatic = async (req, res) => {
  try {
    const rsp = await PaymentMethods.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { isActive: true } }, { $count: "count" }],
          inactive: [{ $match: { isActive: false } }, { $count: "count" }],
          avgFee: [
            { $match: { processingFee: { $ne: null } } },
            {
              $group: {
                _id: null,
                avgFee: { $avg: "$processingFee" }
              }
            }
          ]
        }
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
          active: { $ifNull: [{ $arrayElemAt: ["$active.count", 0] }, 0] },
          inactive: { $ifNull: [{ $arrayElemAt: ["$inactive.count", 0] }, 0] },
          avgFee: {
            $cond: [
              { $gt: [{ $size: "$avgFee" }, 0] },
              { $round: [{ $arrayElemAt: ["$avgFee.avgFee", 0] }, 1] },
              0
            ]
          }
        }
      }
    ]);

    const result = rsp[0] || {};

    const stats = {
      total: result.total || 0,
      active: result.active || 0,
      inactive: result.inactive || 0,
      avgFee: result.avgFee || 0,
    };

    return util.ResSuss(req, res, stats, "Static data fetched successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

// CREATE
const create = async (req, res) => {
  try {
    const {
      name,
      provider,
      type,
      processingFee,
      description,
      apiKey,
      supportedCurrencies,
      webhookUrl,
      isActive,
      imageUrl
    } = req.body;

    const exists = await PaymentMethods.findOne({ name, isDeleted: { $ne: true } });
    if (util.notEmpty(exists)) {
      return util.ResFail(req, res, "Payment method already exists");
    }

    const newData = {
      name,
      provider,
      type,
      processingFee,
      description,
      apiKey,
      supportedCurrencies,
      webhookUrl,
      isActive,
      imageUrl,
      createdBy: req.user?._id
    };

    const created = await PaymentMethods.create(newData);
    return util.ResSuss(req, res, created, "Payment method created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
};

// LIST
const list = async (req, res) => {
  try {
    const { type, status, keyword, pageNo, pageSize } = req.query;

    const query = { isDeleted: { $ne: true } };

    dbUtil.setIfNotEmpty(query, "isActive", status, { skipValue: "all", type: "boolean" });
    dbUtil.setIfNotEmpty(query, "type", type, { skipValue: "all" });
    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);

    const count = await PaymentMethods.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const data = await PaymentMethods.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .lean();

    const maskedData = data.map((item) => {
      if (item.apiKey && item.apiKey.length > 2) {
        const visiblePart = item.apiKey.substring(0, 4); // first 4 chars
        return {
          ...item,
          apiKey: visiblePart + "****", // visible first 4 chars + mask
        };
      } else {
        return {
          ...item,
          apiKey: "****",
        };
      }
    });

    return util.ResListSuss(req, res, maskedData, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { isActive } = req.body;

    const updated = await PaymentMethods.findOneAndUpdate(
      { _id: dbUtil.objectId(id) },
      { $set: { isActive: isActive } },
      { new: true }
    );

    return util.ResSuss(req, res, updated, "Payment method updated successfully")
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

// UPDATE
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      provider,
      type,
      processingFee,
      description,
      apiKey,
      supportedCurrencies,
      webhookUrl,
      isActive,
      imageUrl
    } = req.body;

    const existing = await PaymentMethods.findOne({ _id: dbUtil.objectId(id), isDeleted: { $ne: true } });
    if (util.isEmpty(existing)) {
      return util.ResFail(req, res, "Payment method not found");
    }

    const updateData = {
      name,
      provider,
      type,
      processingFee,
      description,
      apiKey,
      supportedCurrencies,
      webhookUrl,
      isActive,
      imageUrl,
      updatedBy: req.user?._id
    };

    const updated = await PaymentMethods.findOneAndUpdate(
      { _id: dbUtil.objectId(id) },
      { $set: updateData },
      { new: true }
    );

    return util.ResSuss(req, res, updated, "Payment method updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
};

// DELETE (Soft Delete)
const destory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await PaymentMethods.findOne({ _id: dbUtil.objectId(id) });
    if (util.isEmpty(existing)) {
      return util.ResFail(req, res, "Payment method not found");
    }

    const deleted = await PaymentMethods.findOneAndUpdate(
      { _id: dbUtil.objectId(id) },
      {
        $set: {
          isDeleted: true,
          deletedBy: req.user?._id
        }
      },
      { new: true }
    );

    return util.ResSuss(req, res, deleted, "Payment method deleted successfully");
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
  updateStatus,
  getStatic
};
