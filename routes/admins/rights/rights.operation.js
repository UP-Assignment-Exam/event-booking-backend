const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Rights = require("../../../models/Rights.model");
const RightsService = require("../../../services/right-permission.service");

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
      const initRight = await RightsService.initRights();

      return util.ResListSuss(req, res, initRight, initRight.length);
    }

    const rsp = await Rights.find(query)
      .sort({ createdAt: -1 });

    return util.ResListSuss(req, res, rsp, count);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  list
}