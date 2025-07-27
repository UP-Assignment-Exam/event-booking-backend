const dbUtil = require("../../../exports/db.export");
const logger = require("../../../helpers/logger.helper");
const util = require("../../../exports/util");
const AdminUser = require("../../../models/AdminUsers.model");
const Event = require("../../../models/Events.model");

const getDashboardStats = async (req, res) => {
    try {
        const [eventStats, userStats] = await Promise.all([
            Event.aggregate([
                { $match: { isDeleted: false } },
                { $unwind: "$ticketTypes" },
                {
                    $group: {
                        _id: null,
                        totalEvents: { $addToSet: "$_id" }, // use addToSet to avoid duplicates
                        totalTicketsSold: { $sum: "$ticketTypes.soldQuantity" },
                        totalRevenue: {
                            $sum: {
                                $multiply: ["$ticketTypes.price", "$ticketTypes.soldQuantity"]
                            }
                        }
                    }
                },
                {
                    $project: {
                        totalEvents: { $size: "$totalEvents" },
                        totalTicketsSold: 1,
                        totalRevenue: 1
                    }
                }
            ]),

            AdminUser.countDocuments({ status: true, isDeleted: false })
        ]);

        const eventData = eventStats[0] || {};

        const stats = {
            totalEvents: eventData.totalEvents || 0,
            activeUsers: userStats || 0,
            ticketsSold: eventData.totalTicketsSold || 0,
            totalRevenue: eventData.totalRevenue || 0
        };

        return util.ResSuss(req, res, stats, "Static data fetched successfully");
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};


const getRecentEvents = async (req, res) => {
    try {
        const now = new Date();

        const events = await Event.aggregate([
            { $match: { isDeleted: false } },
            { $sort: { startDate: -1 } }, // Most recent startDate first
            { $limit: 3 },
            { $unwind: "$ticketTypes" },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    totalTicketsSold: { $sum: "$ticketTypes.soldQuantity" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$ticketTypes.price", "$ticketTypes.soldQuantity"]
                        }
                    }
                }
            },
            {
                $addFields: {
                    status: {
                        $cond: {
                            if: { $gte: ["$endDate", now] },
                            then: "ACTIVE",
                            else: "ENDED"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    startDate: 1,
                    status: 1,
                    totalTicketsSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return util.ResSuss(req, res, events);
    } catch (error) {
        logger.error(error);
        return util.ResFail(req, res, error);
    }
};

module.exports = {
    getDashboardStats,
    getRecentEvents
}