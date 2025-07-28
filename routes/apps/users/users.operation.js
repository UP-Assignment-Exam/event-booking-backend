const logger = require("../../../helpers/logger.helper");
const dbUtil = require("../../../exports/db.export");
const util = require("../../../exports/util");
const User = require("../../../models/AppUsers.model");
const UserService = require("../../../services/app-user.service");

const getMe = async (req, res) => {
  try {
    const userId = req.user?._id

    const publicUser = await UserService.getPublicUser(userId);

    return util.ResSuss(req, res, publicUser)
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const updateCover = async (req, res) => {
  try {
    const userId = req.user?._id
    const { avatar } = req.body;

    await User.updateOne({
      _id: dbUtil.objectId(userId)
    }, {
      $set: { avatar: avatar }
    })

    return util.ResSuss(req, res, {})
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

const updateBasic = async (req, res) => {
  try {
    const userId = req.user?._id
    const {
      username, firstName,
      lastName, email, phone
    } = req.body;

    await User.updateOne({
      _id: dbUtil.objectId(userId)
    }, {
      $set: {
        username, firstName,
        lastName, email, phone
      }
    })

    return util.ResSuss(req, res, {})
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  getMe,
  updateCover,
  updateBasic
}