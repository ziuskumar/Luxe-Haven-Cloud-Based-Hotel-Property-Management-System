const Booking = require("../Models/booking.js");
const Room = require("../Models/room.js");
const Invoice = require("../Models/invoice.js");
const AuditLog = require("../Models/auditLog.js");

module.exports = {
  async getDashboardAnalytics(req, res) {
    try {
      const { range = "30days" } = req.query;

      const now = new Date();
      let startDate = new Date();

      switch (range) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year_to_date":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "all_time":
        default:
          startDate = new Date(2020, 0, 1);
          break;
      }

      // 1. Total rooms & Occupancy
      const totalRooms = await Room.countDocuments({ isActive: true });
      const occupiedRooms = await Room.countDocuments({ isActive: true, status: "occupied" });
      const availableRooms = await Room.countDocuments({ isActive: true, status: "available" });
      const maintenanceRooms = await Room.countDocuments({
        isActive: true,
        $or: [{ status: "out_of_service" }, { housekeepingStatus: "maintenance" }],
      });

      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // 2. Bookings in range
      const bookingsInRange = await Booking.find({
        createdAt: { $gte: startDate, $lte: now },
      });

      const totalBookings = bookingsInRange.length;
      const confirmedBookings = bookingsInRange.filter((b) => b.status === "confirmed").length;
      const checkedInBookings = bookingsInRange.filter((b) => b.status === "checked_in").length;
      const checkedOutBookings = bookingsInRange.filter((b) => b.status === "checked_out").length;
      const cancelledBookings = bookingsInRange.filter((b) => b.status === "cancelled").length;

      // 3. Revenue from paid invoices in range
      const paidInvoices = await Invoice.find({
        createdAt: { $gte: startDate, $lte: now },
        paymentStatus: { $in: ["paid", "partially_paid"] },
      });

      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.paidAmount || inv.grandTotal || 0), 0);
      const pendingRevenueInvoices = await Invoice.find({
        paymentStatus: "pending",
      });
      const pendingRevenue = pendingRevenueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

      // RevPAR = Total Revenue / Total Available Rooms
      const revPAR = totalRooms > 0 ? Math.round((totalRevenue / totalRooms) * 100) / 100 : 0;

      // 4. Monthly revenue trend for chart (last 6 to 12 months)
      const monthlyRevenue = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const mInvoices = await Invoice.find({
          createdAt: { $gte: mStart, $lte: mEnd },
          paymentStatus: { $in: ["paid", "partially_paid"] },
        });

        const rev = mInvoices.reduce((sum, inv) => sum + (inv.paidAmount || inv.grandTotal || 0), 0);
        const bCount = await Booking.countDocuments({
          createdAt: { $gte: mStart, $lte: mEnd },
          status: { $ne: "cancelled" },
        });

        monthlyRevenue.push({
          month: monthNames[d.getMonth()],
          revenue: Math.round(rev),
          bookings: bCount,
        });
      }

      // 5. Room Category Breakdown
      const categoryAgg = await Room.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$category",
            totalRooms: { $sum: 1 },
            occupied: {
              $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] },
            },
            avgBasePrice: { $avg: "$basePrice" },
          },
        },
      ]);

      const categoryData = categoryAgg.map((cat) => ({
        category: cat._id,
        totalRooms: cat.totalRooms,
        occupied: cat.occupied,
        avgPrice: Math.round(cat.avgBasePrice),
      }));

      // 6. Booking Status Distribution for Pie chart
      const statusDistribution = [
        { name: "Confirmed", value: confirmedBookings, color: "#10b981" },
        { name: "Checked In", value: checkedInBookings, color: "#0284c7" },
        { name: "Checked Out", value: checkedOutBookings, color: "#64748b" },
        { name: "Cancelled", value: cancelledBookings, color: "#ef4444" },
      ].filter((item) => item.value > 0);

      // If empty status distribution, add fallback representation
      if (statusDistribution.length === 0) {
        statusDistribution.push({ name: "Confirmed", value: 1, color: "#10b981" });
      }

      // 7. Recent Transactions & Activities
      const recentInvoices = await Invoice.find()
        .populate("room", "roomNumber category")
        .sort({ createdAt: -1 })
        .limit(6);

      const recentAuditLogs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8);

      res.json({
        success: true,
        timeRange: range,
        kpis: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingRevenue: Math.round(pendingRevenue * 100) / 100,
          totalBookings,
          occupancyRate,
          totalRooms,
          occupiedRooms,
          availableRooms,
          maintenanceRooms,
          revPAR,
        },
        charts: {
          monthlyRevenue,
          statusDistribution,
          categoryData,
        },
        recentTransactions: recentInvoices,
        recentActivities: recentAuditLogs,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
