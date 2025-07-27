const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Categories = require("../../../models/Categories.model");

const checkDuplicate = async (req, { title }, query = {}) => {
  const categoryExists = await Categories.findOne({
    ...query,
    title: dbUtil.getLike(title),
    isDeleted: { $ne: true },
  });

  if (util.notEmpty(categoryExists)) {
    throw Error("Category with this title already exists");
  }
}

const create = async (req, res) => {
  try {
    const { title, color, iconUrl, description } = req.body;

    await checkDuplicate(req, { title });

    const upData = { title, color, iconUrl, description, createdBy: req.user._id, isDeleted: false };

    const rsp = await Categories.updateOne(
      { title: title },
      { $set: upData },
      { upsert: true });

    if (rsp.modifiedCount > 0) {
      return util.ResFail(req, res, "Category creation failed");
    }

    return util.ResSuss(req, res, {}, "Category created successfully");
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

    dbUtil.setLikeOrIfNotEmpty(query, ["title"], keyword);

    const count = await Categories.countDocuments(query);
    if (count === 0) {
      return util.ResListSuss(req, res, [], count);
    }

    const rsp = await Categories.find(query)
      .sort({ createdAt: -1 })
      .skip(dbUtil.defaultPageNo(pageNo))
      .limit(dbUtil.defaultPageSize(pageSize))
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
    const { title, description, color, iconUrl } = req.body;

    await checkDuplicate(req, { title }, { _id: { $ne: dbUtil.objectId(id) } });

    const rsp = await Categories.findOneAndUpdate(
      {
        _id: dbUtil.objectId(id),
        isDeleted: { $ne: true },
      },
      { $set: { title, description, color, iconUrl } },
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

const getAll = async (req, res) => {
  try {
    const query = {
      isDeleted: { $ne: true },
    };

    const rsp = await Categories.find(query);

    return util.ResSuss(req, res, rsp);
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
  getAll
}