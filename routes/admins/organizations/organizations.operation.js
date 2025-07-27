const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Organizations = require("../../../models/Organizations.model");
const dayjs = require("dayjs");

const getStatic = async (req, res) => {
  try {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();

    const rsp = await Organizations.aggregate([
      {
        $facet: {
          activeCount: [
            { $match: { isActive: true } },
            { $count: "count" }
          ],
          suspendCount: [
            { $match: { isActive: false } },
            { $count: "count" }
          ],
          recentCount: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $count: "count" }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          active: { $arrayElemAt: ["$activeCount.count", 0] },
          suspend: { $arrayElemAt: ["$suspendCount.count", 0] },
          recent: { $arrayElemAt: ["$recentCount.count", 0] },
          total: { $arrayElemAt: ["$totalCount.count", 0] }
        }
      }
    ]);

    const result = rsp[0] || {};

    const stats = {
      active: result.active || 0,
      suspend: result.suspend || 0,
      recent: result.recent || 0,
      total: result.total || 0,
    };

    return util.ResSuss(req, res, stats, "Static data fetched successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { isActive, type, keyword, pageNo, pageSize } = req.query;

    const query = {};

    dbUtil.setIfNotEmpty(query, "isActive", isActive, { skipValue: "all", type: "boolean" });
    dbUtil.setIfNotEmpty(query, "type", type, { skipValue: "all" });
    dbUtil.setLikeOrIfNotEmpty(query, ["name", "contactInfo", "email", "phone", "website"], keyword);

    const count = await Organizations.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Organizations.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
      .populate("memberCount")
      .populate("adminUserRequest")
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
    const { isActive } = req.body;

    const rsp = await Organizations.findOneAndUpdate(
      { _id: dbUtil.objectId(id) },
      { $set: { isActive } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Organization not found");
    }

    return util.ResSuss(req, res, rsp, "Organization updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const getAll = async (req, res) => {
  try {

    const rsp = await Organizations.find({});

    return util.ResSuss(req, res, rsp);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  getStatic,
  list,
  update,
  getAll
}