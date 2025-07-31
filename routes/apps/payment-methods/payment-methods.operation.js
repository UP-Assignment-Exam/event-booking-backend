const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const PaymentMethods = require("../../../models/PaymentMethods.model");

const list = async (req, res) => {
  try {
    const { pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true },
      isActive: { $eq: true }
    };

    const count = await PaymentMethods.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await PaymentMethods.find(query, "name provider type processingFee description supportedCurrencies imageUrl")
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize));

    return util.ResListSuss(req, res, rsp, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  list,
}