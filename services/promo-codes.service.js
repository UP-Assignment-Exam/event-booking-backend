const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
const PromoCode = require('../models/PromoCode.model'); 

async function generateUniquePromoCodeWithPrefix(prefix, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = [prefix, nanoid()].join("");
    const exists = await PromoCode.findOne({ promoCode: code, isDeleted: { $ne: true } });
    if (!exists) return code;
  }
  throw new Error('Failed to generate unique promo code');
}

module.exports = {
    generateUniquePromoCodeWithPrefix
}