const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const RequestCategories = require("../../../models/RequestCategories.model");
const Categories = require("../../../models/Categories.model");

const create = async (req, res) => {
  try {
    const { name, color, iconUrl } = req.body;

    const upData = { name, color, iconUrl, createdBy: req.user._id, isDeleted: false };

    const exists = await Categories.findOne(
      { name: name, isDeleted: { $ne: true } },
    );

    if (util.notEmpty(exists)) {
      return util.ResFail(req, res, "Categories already exists");
    }

    const rsp = await RequestCategories.updateOne(
      { name: name, createdBy: req.user._id },
      { $set: upData },
      { upsert: true },
    );

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Request Category creation failed");
    }

    return util.ResSuss(req, res, {}, "Request Category created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { status, keyword, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);
    dbUtil.setIfNotEmpty(query, ["status"], status);

    const count = await RequestCategories.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const roles = await RequestCategories.find(query)
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
    const { status } = req.body;

    const requestCategory = await RequestCategories.findOne({
      _id: dbUtil.objectId(id),
      isDeleted: { $ne: true },
    });

    if (util.notEmpty(status)) {
      if ("approved" === status) {
        const category = await Categories.findOne({
          isDeleted: { $ne: true },
          name: requestCategory.name,
        });

        if (util.isEmpty(category)) {
          return util.ResFail(res, res, "Category already exists!");
        }
      }
    }

    const rsp = await RequestCategories.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { status, actionAt: new Date(), actionBy: req.user?._id } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Request Category not found");
    }

    if (util.notEmpty(status)) {
      if ("approved" === status) {
        await Categories.create([
          {
            name: requestCategory.name,
            color: requestCategory.color,
            iconUrl: requestCategory.iconUrl,
            createdBy: requestCategory.createdBy,
            isDeleted: false,
          }
        ]);
      }
    }

    return util.ResSuss(req, res, rsp, "Request Category updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  create,
  list,
  update,
}