const Booking = require("../Models/booking.js");

const STATUS_COLORS = {
  confirmed: { bg: "#10b981", border: "#059669", text: "#ffffff" }, // Green
  checked_in: { bg: "#0284c7", border: "#0369a1", text: "#ffffff" }, // Blue
  checked_out: { bg: "#64748b", border: "#475569", text: "#ffffff" }, // Slate
  pending: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" }, // Amber
  cancelled: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" }, // Red
};

module.exports = {
  // Calendar events feed for FullCalendar
  async getEvents(req, res) {
    try {
      const { start, end } = req.query;
      const query = {
        status: { $ne: "cancelled" }, // optionally include or exclude
      };

      if (start && end) {
        query.$or = [
          { checkInDate: { $gte: new Date(start), $lte: new Date(end) } },
          { checkOutDate: { $gte: new Date(start), $lte: new Date(end) } },
          {
            checkInDate: { $lte: new Date(start) },
            checkOutDate: { $gte: new Date(end) },
          },
        ];
      }

      const bookings = await Booking.find(query)
        .populate("room")
        .populate("guest", "name email phone");

      const events = bookings.map((b) => {
        const color = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
        const roomNum = b.room?.roomNumber || "N/A";
        const guestName = b.guestDetails?.name || "Guest";

        return {
          id: b._id,
          title: `Room ${roomNum}: ${guestName}`,
          start: b.checkInDate,
          end: b.checkOutDate,
          backgroundColor: color.bg,
          borderColor: color.border,
          textColor: color.text,
          extendedProps: {
            bookingNumber: b.bookingNumber,
            room: b.room,
            guestDetails: b.guestDetails,
            status: b.status,
            paymentStatus: b.paymentStatus,
            totalAmount: b.pricing?.totalAmount,
            nights: b.nights,
            roomKeyNumber: b.roomKeyNumber,
            checkInTime: b.checkInTime,
            checkOutTime: b.checkOutTime,
          },
        };
      });

      res.json({
        success: true,
        events,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Daily arrivals & departures for Front Desk operations
  async getDailySchedule(req, res) {
    try {
      const targetDate = req.query.date ? new Date(req.query.date) : new Date();

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Arrivals today
      const arrivals = await Booking.find({
        checkInDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["confirmed", "checked_in"] },
      }).populate("room");

      // Departures today
      const departures = await Booking.find({
        checkOutDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["checked_in", "checked_out"] },
      }).populate("room");

      // In-house guests currently staying
      const inHouse = await Booking.find({
        status: "checked_in",
      }).populate("room");

      res.json({
        success: true,
        date: startOfDay.toISOString(),
        arrivalsCount: arrivals.length,
        departuresCount: departures.length,
        inHouseCount: inHouse.length,
        arrivals,
        departures,
        inHouse,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
