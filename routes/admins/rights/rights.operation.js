const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const Rights = require("../../../models/Rights.model");

const list = async (req, res) => {
  try {
    const { type, keyword } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };
    
    dbUtil.setIfNotEmpty(query, "type", type);
    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);

    const count = await Rights.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Rights.find(query)
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