const util = require("./util");
const moment = require("moment");
const mongoose = require("mongoose");

const TIMEZONE = process.env.TIMEZONE || "Asia/Kolkata";

const objectId = (id) => {
    if (util.notEmpty(id)) {
        return new mongoose.Types.ObjectId(id)
    }
    return null
}

function defaultPageNo(pageNo) {
    if (util.isEmpty(pageNo)) {
        return 0
    }
    pageNo = parseInt(pageNo)
    return pageNo < 0 ? 0 : pageNo - 1
}

function defaultPageSize(pageSize) {
    let max = process.env.MAX_PAGE_SIZE ? process.env.MAX_PAGE_SIZE : 150
    max = parseInt(max)
    pageSize = parseInt(pageSize)
    if (util.isEmpty(pageSize)) {
        return max
    }

    return pageSize > max || pageSize < 1 ? max : pageSize
}

const lookupOneFromArrayPipeline = (from, localField, foreignField, as, lookupPipeLine, extraPipeline) => {
    return [
        { $unwind: "$" + localField[0] },
        { $lookup: { from: from, localField: localField.join("."), foreignField: foreignField, as: as.join("."), pipeline: lookupPipeLine } },
        { $unwind: { path: "$" + as.join("."), preserveNullAndEmptyArrays: true } },
        ...extraPipeline,
        { $group: { _id: "$_id", doc: { $first: "$$ROOT" }, [localField[0]]: { $push: "$" + localField[0] } } },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { [localField[0]]: "$" + localField[0] }] } } }
    ];
}

const lookupOnePipeline = (from, localField, foreignField, as, pipeline) => {
    return [
        {
            $lookup: {
                from: from,
                localField: localField,
                foreignField: foreignField,
                pipeline: pipeline,
                as: as
            },
        },
        {
            $unwind: {
                path: "$" + as,
                preserveNullAndEmptyArrays: true,
            },
        },
    ]
}

const lookupManyPipeline = (from, localField, foreignField, as, pipeline, letVars = undefined) => {
    const lookupStage = {
        $lookup: {
            from: from,
            localField: localField,
            foreignField: foreignField,
            pipeline: pipeline,
            as: as,
        },
    };

    if (util.notEmpty(letVars)) {
        lookupStage.$lookup.let = letVars;
    }

    return [lookupStage];
}

const lookupOne = (from, localField, foreignField, as) => {
    return [
        {
            $lookup: {
                from: from,
                localField: localField,
                foreignField: foreignField,
                as: as,
            },
        },
        {
            $unwind: {
                path: "$" + as,
                preserveNullAndEmptyArrays: true,
            },
        },
    ]
}

const lookupMany = (from, localField, foreignField, as) => {
    return [
        {
            $lookup: {
                from: from,
                localField: localField,
                foreignField: foreignField,
                as: as,
            },
        },
    ]
}

function setQueryBetweenDate(query, startDate, endDate, filename, timeZone, noDefault) {
    let timezone = TIMEZONE;

    if (util.notEmpty(timeZone)) {
        timezone = timeZone;
    }

    if (util.isEmpty(startDate) && util.isEmpty(endDate)) {
        return query
    }

    let start = moment(startDate);
    let end = moment(endDate);

    if (!noDefault) {
        start = start.tz(timezone, true)
        end = end.tz(timezone, true)
    }
    start = start.startOf('day')
    end = end.endOf('day')


    if (util.notEmpty(startDate) && util.isEmpty(endDate)) {
        query[filename] = { $gte: start.toDate() }
        return query
    }

    if (util.isEmpty(startDate) && util.notEmpty(endDate)) {
        query[filename] = { $lt: end.toDate(), }
        return query
    }

    query[filename] = {
        $gte: start.toDate(),
        $lte: end.toDate(),
    }

    return query
}

/**
 * Sets a property on the target object if the value is not empty and not equal to the optional skip value.
 *
 * @param {Object} target - The object to set the value on.
 * @param {string} key - The key of the property to set.
 * @param {*} value - The value to set if not empty and not equal to skipValue.
 * @param {Object} [options={}] - Optional settings.
 * @param {string|null} [options.type=null] - Expected type of value; if "boolean", value will be converted.
 * @param {*} [options.skipValue=null] - A value that, if matched, will skip assignment.
 */
function setIfNotEmpty(target, key, value, options = {}) {
    const { type = null, skipValue = null } = options;
    
    if (util.notEmpty(value) && value != skipValue) {
        if (type === "boolean") {
            target[key] = value === "true" || value === true;
        } else {
            target[key] = value;
        }
    }
}

function setLikeOrIfNotEmpty(target, keys = [], value) {
    if (util.isEmpty(value)) return;

    const conditions = keys.map((key) => ({
        [key]: { $regex: new RegExp(value, 'i') },
    }));

    if (conditions.length > 0) {
        target.$or = target.$or ? target.$or.concat(conditions) : conditions;
    }
}

function getLike(value) {
    return { $regex: new RegExp(value, 'i') };
}

module.exports = {
    lookupOneFromArrayPipeline,
    lookupOnePipeline,
    lookupManyPipeline,
    lookupOne,
    lookupMany,
    setQueryBetweenDate,
    TIMEZONE,
    defaultPageSize,
    defaultPageNo,
    setIfNotEmpty,
    objectId,
    setLikeOrIfNotEmpty,
    getLike
};