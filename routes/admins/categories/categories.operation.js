const dbUtil = require("../../../exports/db.export");
const logger = require("../../../exports/logger");
const util = require("../../../exports/util");
const Categories = require("../../../models/Categories.model");

const checkDuplicate = async (req, { name }, query = {}) => {
  const categoryExists = await Categories.findOne({
    ...query,
    name: dbUtil.getLike(name),
    isDeleted: { $ne: true },
  });

  if (util.notEmpty(categoryExists)) {
    throw Error("Category with this name already exists");
  }
}

const create = async (req, res) => {
  try {
    const { name, color, iconUrl } = req.body;

    await checkDuplicate(req, { name });

    const upData = { name, color, iconUrl, createdBy: req.user._id, isDeleted: false };

    const rsp = await Categories.updateOne(
      { name: name },
      { $set: upData },
      { upsert: true });

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Role creation failed");
    }

    return util.ResSuss(req, res, {}, "Role created successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const list = async (req, res) => {
  try {
    const { keyword, pageNo, pageSize } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    dbUtil.setLikeOrIfNotEmpty(query, ["name"], keyword);

    const count = await Categories.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const roles = await Categories.find(query)
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
    const { name, color, iconUrl } = req.body;

    await checkDuplicate(req, { name }, { _id: { $ne: dbUtil.objectId(id) } });

    const rsp = await Categories.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { name, color, iconUrl } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Category not found");
    }

    return util.ResSuss(req, res, rsp, "Category updated successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const destory = async (req, res) => {
  try {
    const { id } = req.params;

    const rsp = await Categories.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (util.isEmpty(rsp)) {
      return util.ResFail(req, res, "Category not found");
    }

    return util.ResSuss(req, res, rsp, "Category deleted successfully");
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  create,
  list,
  update,
  destory
}