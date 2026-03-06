const Order = require("../models/Orders");
const Product = require("../models/Products");
const User = require("../models/Users");

async function getDashboardData(req, res) {
  try {
    // Stats
    console.log("Fetching dashboard data...");
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();

    // Latest Orders
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("products.product", "title");

    res.status(200).json({
      stats: {
        orders: ordersCount,
        products: productsCount,
        users: usersCount,
      },
      latestOrders,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboardData,
}
