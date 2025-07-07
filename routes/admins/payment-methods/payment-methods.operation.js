const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const PaymentMethods = require("../../../models/PaymentMethods.model");

const list = async (req, res) => {
  try {
    const { type, keyword } = req.query;

    const query = {
      isActive: true
    };
    
    dbUtil.setIfNotEmpty(query, "type", type);
    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);

    const count = await PaymentMethods.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await PaymentMethods.find(query, "-_id -isActive")
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
  list
}