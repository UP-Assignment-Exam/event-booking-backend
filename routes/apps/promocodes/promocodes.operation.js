const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const Promocodes = require("../../../models/PromoCode.model");

const searchCode = async (req, res) => {
  try {
    const { code } = req.query;

    const now = new Date();

    const query = {
      isDeleted: { $ne: true },
      promoCode: code.toUpperCase(),
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ["$currentUses", "$maxUses"] }
    };

    const promo = await Promocodes.findOne(query);

    if (!promo) {
      return util.ResFail(req, res, "Invalid or expired promo code");
    }

    return util.ResSuss(req, res, promo);
  } catch (error) {
    logger.error(error);
    return util.ResFail(req, res, error);
  }
}

module.exports = {
  searchCode,
}