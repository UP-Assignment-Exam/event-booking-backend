const mongoose = require("mongoose")
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Normalize the value of pageSize
 * @param {int} pageSize
 * @returns {int}
 */
function defaultPageSize(pageSize) {
    let max = process.env.MAX_PAGE_SIZE ? process.env.MAX_PAGE_SIZE : 150
    max = parseInt(max)
    pageSize = parseInt(pageSize)
    if (isEmpty(pageSize)) {
        return max
    }

    return pageSize > max || pageSize < 1 ? max : pageSize
}

/**
 * Normalize the value of pageNo
 * @param {int} pageNo
 * @returns {int}
 */
function defaultPageNo(pageNo) {
    if (isEmpty(pageNo)) {
        return 1
    }
    pageNo = parseInt(pageNo)
    return pageNo < 1 ? 1 : pageNo
}


function notEmpty(data) {
    return !isEmpty(data)
}

const objectId = (id) => {
    if (notEmpty(id)) {
        return new mongoose.Types.ObjectId(id)
    }
    return null
}

function isEmpty(data) {
    if (data === null || data === undefined || data === "") {
        return true
    }
    if (typeof data == "boolean") {
        return false
    }

    if (typeof data == "string" || typeof data === undefined || typeof data === "undefined") {
        return data === null || data === undefined || data === "" || data === "undefined"
    }

    if (typeof data == "number" && parseFloat(data) === 0) {
        return true
    }

    if (typeof data == "number" && isNaN(data)) {
        return true
    }

    if (data instanceof mongoose.Types.ObjectId) {
        return false
    }

    if (data instanceof Array) {
        return data.length === 0
    }
    if (data instanceof Date) {
        return false
    }

    if (typeof data == "object") {
        return Object.keys(data).length === 0
    }

    return false
}


// Generate secure random token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

const ResListSuss = (req, res, data = [], total = 0, message = "Successfully") => {
    let defaultPage = defaultPageSize(req.query.MAX_PAGE_SIZE)

    return res.send({
        status: 200,
        message: message,
        data: data,
        total: total,
        pageNo: req.query.pageNo ? parseInt(req.query.pageNo) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : defaultPage
    })
}

const ResSuss = (req, res, data = {}, message = "Successfully") => {
    return res.send({
        status: 200,
        message: message,
        data: data,
    })
}

function isError(v) {
    return v instanceof Error && typeof v.message !== "undefined"
}

function isString(v) {
    return typeof v === "string"
}

/**
 * Return status code and business code on failure
 * @param {*} req
 * @param {*} res
 * @param {*} rsp  error or errorCode
 * @param {*} data returned data, empty if not present
 * @returns none
 */
function ResFail(req, res, rsp, status, data = null) {
    let response = {}

    // If it is an error, handle accordingly
    if (isError(rsp)) {
        response.message = rsp.message
        response.status = status || 400 //default
        response.errorCode = 100000 //default
        // Handle when the message is an error message
        try {
            let tempObj = JSON.parse(rsp.message)
            if (tempObj instanceof Object && tempObj.errorCode > 0) {
                response.status = tempObj.status
                response.errorCode = tempObj.errorCode
                response.message = tempObj.message
                if (notEmpty(tempObj.data)) {
                    response.data = tempObj.data
                }
            }
        } catch (error) { }
    } else {
        if (isString(rsp)) {
            response.message = rsp
            response.status = status || 400 //default
            response.errorCode = 100000 //default
        } else {
            // Handle when it is an errCode error object
            response.status = rsp.status
            response.errorCode = rsp.errorCode
            response.message = rsp.message

            if (notEmpty(rsp?.errorData)) {
                response.data = rsp.errorData
            }
        }
    }

    if (notEmpty(data)) {
        response.data = data;
    }
    return res.status(status || 400).send(response)
}

function generateStrongPassword(length = 12) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '@';
    const all = upper + lower + digits + special;

    const getRandom = (chars) => chars[Math.floor(Math.random() * chars.length)];

    let password = [
        getRandom(upper),
        getRandom(special),
        getRandom(lower),
        getRandom(digits),
    ];

    while (password.length < length) {
        password.push(getRandom(all));
    }

    // Shuffle the password so fixed characters aren't always at the front
    password = password.sort(() => 0.5 - Math.random()).join('');
    return password;
}

const hashedPassword = async (password) => {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

function generateOTP(length = 4) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

module.exports = {
    notEmpty,
    isEmpty,
    validateEmail,
    hashToken,
    generateResetToken,
    ResSuss,
    ResFail,
    objectId,
    defaultPageSize,
    defaultPageNo,
    ResListSuss,
    generateStrongPassword,
    hashedPassword,
    generateOTP
}
