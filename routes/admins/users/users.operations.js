const util = require("../../../exports/util");
const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const AdminUser = require("../../../models/AdminUsers.model");
const EmailService = require("../../../exports/mailer");

const list = async (req, res) => {
    try {
        const {
            keyword,
            isDeleted = "false",
            isSetup = "all",
            role = "all",
            organization = "all",
            pageNo,
            pageSize,
        } = req.query;

        const query = {};

        dbUtil.setIfNotEmpty(query, "isDeleted", isDeleted === "true", { skipValue: "all" });
        dbUtil.setLikeOrIfNotEmpty(query, ["username", "firstName", "lastName", "email", "phone"], keyword);
        dbUtil.setIfNotEmpty(query, "isSetup", isSetup, { skipValue: "all", type: "boolean" });
        dbUtil.setIfNotEmpty(query, "role", role, { skipValue: "all" });
        dbUtil.setIfNotEmpty(query, "organization", organization, { skipValue: "all" });

        const count = await AdminUser.countDocuments(query);
        if (count === 0) {
            return util.ResListSuss(req, res, [], count);
        }

        const items = await AdminUser.find(query, "-password")
            .sort({ createdAt: -1 })
            .skip(dbUtil.defaultPageNo(pageNo))
            .limit(dbUtil.defaultPageSize(pageSize))
            .populate("role organization");

        return util.ResListSuss(req, res, items, count);
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

const create = async (req, res) => {
    try {
        const { username, firstName, lastName, email, phone, role, organization } = req.body;

        const existing = await AdminUser.findOne({ email, isDeleted: false });
        if (existing) return util.ResFail(req, res, "Admin with this email already exists");

        const temporaryPassword = util.generateStrongPassword();
        const user = await AdminUser.create({
            username,
            firstName,
            lastName,
            password: await util.hashedPassword(temporaryPassword),
            email,
            phone,
            role,
            organization,
            isSetup: false
        });

        const tempUser = await AdminUser.findOne({ _id: dbUtil.objectId(user?._id) }).populate("role").populate("organization")
        tempUser.temporaryPassword = temporaryPassword;
        await EmailService.sendUserCreationEmail(tempUser);

        return util.ResSuss(req, res, {}, "Admin created and email sent successfully.");
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, firstName, lastName, phone, email, role, organization, isSetup } = req.body;

        const admin = await AdminUser.findOneAndUpdate(
            { _id: dbUtil.objectId(id), isDeleted: { $ne: true } },
            {
                $set: {
                    username,
                    firstName,
                    lastName,
                    phone,
                    email,
                    role,
                    organization,
                    isSetup,
                }
            },
            { new: true }
        );

        if (!admin) return util.ResFail(req, res, "Admin not found");

        return util.ResSuss(req, res, admin, "Admin updated successfully");
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await AdminUser.findOneAndUpdate(
            { _id: dbUtil.objectId(id), isDeleted: { $ne: true } },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!admin) return util.ResFail(req, res, "Admin not found");

        return util.ResSuss(req, res, admin, "Admin deleted successfully");
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

const getStatic = async (req, res) => {
    try {
        const rsp = await AdminUser.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    active: [{ $match: { isSetup: true, status: true } }, { $count: "count" }],
                    inactive: [{ $match: { $or: [{ isSetup: false, }, { status: false }] } }, { $count: "count" }],
                    withSetup: [{ $match: { password: { $ne: null } } }, { $count: "count" }],
                    withoutSetup: [{ $match: { password: null } }, { $count: "count" }],
                    withOrganization: [{ $match: { organization: { $ne: null } } }, { $count: "count" }]
                }
            },
            {
                $project: {
                    total: { $arrayElemAt: ["$total.count", 0] },
                    active: { $arrayElemAt: ["$active.count", 0] },
                    inactive: { $arrayElemAt: ["$inactive.count", 0] },
                    withSetup: { $arrayElemAt: ["$withSetup.count", 0] },
                    withoutSetup: { $arrayElemAt: ["$withoutSetup.count", 0] },
                    withOrganization: { $arrayElemAt: ["$withOrganization.count", 0] }
                }
            }
        ]);

        const result = rsp[0] || {};

        const stats = {
            total: result.total || 0,
            active: result.active || 0,
            inactive: result.inactive || 0,
            withSetup: result.withSetup || 0,
            withoutSetup: result.withoutSetup || 0,
            withOrganization: result.withOrganization || 0,
        };

        return util.ResSuss(req, res, stats, "Static data fetched successfully");
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

const updateStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const rsp = await AdminUser.findOneAndUpdate(
            { _id: dbUtil.objectId(id) },
            { $set: { status: status } },
            { new: true }
        )

        return util.ResSuss(req, res, rsp);
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
}

module.exports = {
    list,
    create,
    update,
    destroy,
    getStatic,
    updateStatus
};
