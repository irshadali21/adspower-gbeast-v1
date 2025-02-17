const User = require("../models/User");
const BrowserProfile = require("../models/BrowserProfile");
const { getRunningProfiles } = require("../utils/puppeteerSetup");

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProfiles = await BrowserProfile.countDocuments();

        // Aggregate user registrations by month
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const recentActivity = await BrowserProfile.find({}, "profileName lastLaunched")
            .sort({ lastLaunched: -1 })
            .limit(5);

        res.json({
            totalUsers,
            totalProfiles,
            userGrowth,
            recentActivity,
        });
    } catch (error) {
        console.error("❌ Failed to fetch dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch stats", error });
    }
};

const getRunningBrowsers = async (req, res) => {
    try {
      const runningProfiles = await getRunningProfiles();
      res.json({ runningProfiles });
    } catch (error) {
      console.error("❌ Failed to fetch running browsers:", error);
      res.status(500).json({ message: "Failed to fetch running browsers", error });
    }
  };

module.exports = { getDashboardStats, getRunningBrowsers };
