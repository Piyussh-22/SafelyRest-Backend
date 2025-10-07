// controllers/admin.controller.js
import User from "../models/user.js";
import { House } from "../models/house.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments();
    const totalHosts = await User.countDocuments({ userType: "host" });
    const totalGuests = await User.countDocuments({ userType: "guest" });
    const totalHouses = await House.countDocuments();

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName userType createdAt");

    return res.json({
      success: true,
      data: {
        totalMembers,
        totalHosts,
        totalGuests,
        totalHouses,
        recentUsers,
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
    });
  }
};
