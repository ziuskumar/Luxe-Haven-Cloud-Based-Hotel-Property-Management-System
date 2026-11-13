const Booking = require("../Models/booking.js");
const {
  checkRoomAvailability,
  createBooking,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
} = require("../services/reservationService.js");
const { calculateRoomPrice } = require("../services/pricingService.js");

module.exports = {
  // Check real-time room availability
  async checkAvailability(req, res) {
    try {
      const { roomId, checkInDate, checkOutDate, excludeBookingId } = req.query;

      if (!roomId || !checkInDate || !checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "roomId, checkInDate, and checkOutDate are required.",
        });
      }

      const result = await checkRoomAvailability(
        roomId,
        checkInDate,
        checkOutDate,
        excludeBookingId
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Calculate dynamic price preview
  async calculatePrice(req, res) {
    try {
      const { roomId, checkInDate, checkOutDate, promoCode, extraServices } = req.body;

      if (!roomId || !checkInDate || !checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "roomId, checkInDate, and checkOutDate are required.",
        });
      }

      const pricing = await calculateRoomPrice({
        roomId,
        checkInDate,
        checkOutDate,
        promoCode,
        extraServices,
      });

      res.json({
        success: true,
        pricing,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Create booking
  async create(req, res) {
    try {
      const {
        roomId,
        checkInDate,
        checkOutDate,
        guestDetails,
        numberOfGuests,
        promoCode,
        extraServices,
        paymentMethod,
        paymentStatus,
      } = req.body;

      if (!roomId || !checkInDate || !checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "roomId, checkInDate, and checkOutDate are required.",
        });
      }

      const guestId = req.user._id;
      const details = {
        name: guestDetails?.name || req.user.name,
        email: guestDetails?.email || req.user.email,
        phone: guestDetails?.phone || req.user.phone || "",
        specialRequests: guestDetails?.specialRequests || "",
      };

      const result = await createBooking({
        roomId,
        guestId,
        guestDetails: details,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        promoCode,
        extraServices,
        paymentMethod: paymentMethod || "card",
        paymentStatus: paymentStatus || "paid",
      });

      res.status(201).json({
        success: true,
        message: `Booking ${result.booking.bookingNumber} created successfully!`,
        booking: result.booking,
        invoice: result.invoice,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Failed to create booking.",
      });
    }
  },

  // Get bookings (filtered by role)
  async getBookings(req, res) {
    try {
      const { status, paymentStatus, search, startDate, endDate } = req.query;
      const query = {};

      // If customer, restrict to their own bookings
      if (req.user.role === "customer") {
        query.guest = req.user._id;
      }

      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;

      if (startDate || endDate) {
        query.checkInDate = {};
        if (startDate) query.checkInDate.$gte = new Date(startDate);
        if (endDate) query.checkInDate.$lte = new Date(endDate);
      }

      if (search) {
        query.$or = [
          { bookingNumber: { $regex: search, $options: "i" } },
          { "guestDetails.name": { $regex: search, $options: "i" } },
          { "guestDetails.email": { $regex: search, $options: "i" } },
        ];
      }

      const bookings = await Booking.find(query)
        .populate("room")
        .populate("guest", "name email phone role")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get single booking
  async getBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("room")
        .populate("guest", "name email phone");

      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found." });
      }

      // Check authorization
      if (
        req.user.role === "customer" &&
        booking.guest._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      res.json({ success: true, booking });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Cancel booking
  async cancel(req, res) {
    try {
      const { reason } = req.body;
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found." });
      }

      // Authorization check
      if (
        req.user.role === "customer" &&
        booking.guest.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const cancelledBooking = await cancelBooking(req.params.id, reason, req.user);

      res.json({
        success: true,
        message: `Booking ${cancelledBooking.bookingNumber} has been cancelled.`,
        booking: cancelledBooking,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Check-in guest (Staff only: receptionist, manager, admin)
  async checkIn(req, res) {
    try {
      const { roomKeyNumber } = req.body;
      const booking = await checkInGuest(req.params.id, { roomKeyNumber }, req.user);

      res.json({
        success: true,
        message: `Guest successfully checked in. Key #${booking.roomKeyNumber} assigned.`,
        booking,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Check-out guest (Staff only: receptionist, manager, admin)
  async checkOut(req, res) {
    try {
      const booking = await checkOutGuest(req.params.id, req.user);

      res.json({
        success: true,
        message: `Guest successfully checked out. Room marked for housekeeping.`,
        booking,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
};
