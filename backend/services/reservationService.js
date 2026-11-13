/**
 * Reservation Engine for Luxe Haven PMS
 * Handles double-booking prevention, availability verification, check-in/out workflows, and modifications.
 */

const Booking = require("../Models/booking.js");
const Room = require("../Models/room.js");
const AuditLog = require("../Models/auditLog.js");
const { calculateRoomPrice } = require("./pricingService.js");
const { createInvoiceForBooking } = require("./invoiceService.js");
const { sendNotification } = require("./notificationService.js");

/**
 * Check if a room is available for given date range.
 * Overlap condition:
 * An existing booking overlaps if:
 * existing.checkInDate < newCheckOutDate AND existing.checkOutDate > newCheckInDate
 */
async function checkRoomAvailability(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error("Invalid check-in or check-out date.");
  }

  if (checkIn >= checkOut) {
    throw new Error("Check-out date must be after check-in date.");
  }

  const query = {
    room: roomId,
    status: { $in: ["pending", "confirmed", "checked_in"] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(query);
  return {
    isAvailable: !overlappingBooking,
    conflictingBooking: overlappingBooking,
  };
}

/**
 * Find all rooms available between checkIn and checkOut with optional filters
 */
async function findAvailableRooms({
  checkInDate,
  checkOutDate,
  category,
  minPrice,
  maxPrice,
  adults = 1,
  children = 0,
}) {
  const roomFilter = { isActive: true };

  if (category && category !== "All") {
    roomFilter.category = category;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    roomFilter.basePrice = {};
    if (minPrice !== undefined) roomFilter.basePrice.$gte = Number(minPrice);
    if (maxPrice !== undefined) roomFilter.basePrice.$lte = Number(maxPrice);
  }
  if (adults) {
    roomFilter["maxOccupancy.adults"] = { $gte: Number(adults) };
  }

  const allMatchingRooms = await Room.find(roomFilter).sort({ basePrice: 1 });

  // If dates are provided, filter out booked rooms
  if (!checkInDate || !checkOutDate) {
    return allMatchingRooms;
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Find all booked room IDs for this time window
  const bookedRoomIds = await Booking.distinct("room", {
    status: { $in: ["pending", "confirmed", "checked_in"] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

  const bookedSet = new Set(bookedRoomIds.map((id) => id.toString()));

  return allMatchingRooms.filter((room) => !bookedSet.has(room._id.toString()));
}

/**
 * Generate sequential booking number (e.g. BK-2026-0001)
 */
async function generateBookingNumber() {
  const mongoose = require("mongoose");
  const year = new Date().getFullYear();
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const count = await Booking.countDocuments();
      const seq = (count + 1).toString().padStart(4, "0");
      return `BK-${year}-${seq}`;
    } catch (err) {}
  }
  return `BK-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Create a new booking with double-booking prevention
 */
async function createBooking({
  roomId,
  guestId,
  guestDetails,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  promoCode = "",
  extraServices = [],
  paymentMethod = "card",
  paymentStatus = "paid", // or "pending"
}) {
  // 1. Strict double booking prevention
  const { isAvailable, conflictingBooking } = await checkRoomAvailability(
    roomId,
    checkInDate,
    checkOutDate
  );

  if (!isAvailable) {
    throw new Error(
      `Room is unavailable for selected dates (conflict with booking ${conflictingBooking.bookingNumber}). Double-booking prevented.`
    );
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found.");
  }

  // 2. Dynamic pricing calculation
  const pricingResult = await calculateRoomPrice({
    roomId,
    checkInDate,
    checkOutDate,
    promoCode,
    extraServices,
  });

  const bookingNumber = await generateBookingNumber();

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const booking = new Booking({
    bookingNumber,
    room: roomId,
    guest: guestId,
    guestDetails,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nights,
    numberOfGuests: numberOfGuests || { adults: 1, children: 0 },
    status: "confirmed",
    pricing: {
      baseRatePerNight: pricingResult.baseRatePerNight,
      nights,
      subtotal: pricingResult.baseSubtotal,
      dynamicAdjustment: pricingResult.dynamicAdjustment,
      taxRate: pricingResult.taxRate,
      cgst: pricingResult.cgst,
      sgst: pricingResult.sgst,
      taxAmount: pricingResult.taxAmount,
      discountAmount: pricingResult.discountAmount,
      discountCode: pricingResult.discountCode,
      extraServicesTotal: pricingResult.extraServicesTotal,
      totalAmount: pricingResult.totalAmount,
    },
    extraServices: extraServices || [],
    paymentStatus: paymentStatus || "paid",
    paymentMethod: paymentMethod || "card",
    paidAmount: paymentStatus === "paid" ? pricingResult.totalAmount : 0,
    transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  });

  await booking.save();

  // 3. Create sequential GST compliant invoice
  const invoice = await createInvoiceForBooking(booking, room);

  // 4. Log audit action
  await AuditLog.create({
    user: guestId,
    userName: guestDetails?.name || "Guest",
    userRole: "customer",
    action: "BOOKING_CREATED",
    entityType: "Booking",
    entityId: booking._id.toString(),
    details: {
      bookingNumber,
      roomNumber: room.roomNumber,
      totalAmount: pricingResult.totalAmount,
    },
  });

  // 5. Send real-time notification
  await sendNotification({
    targetRoles: ["admin", "hotel_manager", "receptionist"],
    type: "booking_created",
    title: `New Reservation: ${bookingNumber}`,
    message: `${guestDetails.name} booked Room ${room.roomNumber} (${room.category}) for ${nights} night(s). Total: $${pricingResult.totalAmount}`,
    data: { bookingId: booking._id, invoiceId: invoice._id },
    guestEmail: guestDetails.email,
    bookingDetails: {
      bookingNumber,
      roomTitle: room.title,
      roomNumber: room.roomNumber,
      checkInDate: checkIn.toDateString(),
      checkOutDate: checkOut.toDateString(),
      totalAmount: pricingResult.totalAmount,
    },
  });

  return { booking, invoice };
}

/**
 * Check-in workflow
 */
async function checkInGuest(bookingId, { roomKeyNumber = "" }, staffUser) {
  const booking = await Booking.findById(bookingId).populate("room");
  if (!booking) throw new Error("Booking not found");

  if (booking.status === "checked_in") {
    throw new Error("Guest is already checked in.");
  }
  if (booking.status === "cancelled") {
    throw new Error("Cannot check in a cancelled booking.");
  }

  booking.status = "checked_in";
  booking.checkInTime = new Date();
  booking.roomKeyIssued = true;
  booking.roomKeyNumber = roomKeyNumber || `KEY-${booking.room.roomNumber}`;
  await booking.save();

  // Update room status
  const room = await Room.findById(booking.room._id);
  if (room) {
    room.status = "occupied";
    room.housekeepingStatus = "inspected";
    await room.save();
  }

  // Audit log
  await AuditLog.create({
    user: staffUser?._id,
    userName: staffUser?.name || "Front Desk",
    userRole: staffUser?.role || "receptionist",
    action: "GUEST_CHECKED_IN",
    entityType: "Booking",
    entityId: booking._id.toString(),
    details: {
      bookingNumber: booking.bookingNumber,
      roomNumber: booking.room.roomNumber,
      roomKeyNumber: booking.roomKeyNumber,
    },
  });

  // Notification
  await sendNotification({
    targetRoles: ["admin", "hotel_manager", "receptionist"],
    type: "check_in",
    title: `Guest Checked In: Room ${booking.room.roomNumber}`,
    message: `${booking.guestDetails.name} checked into Room ${booking.room.roomNumber}. Key #${booking.roomKeyNumber} issued.`,
    data: { bookingId: booking._id, roomId: booking.room._id },
  });

  return booking;
}

/**
 * Check-out workflow
 */
async function checkOutGuest(bookingId, staffUser) {
  const booking = await Booking.findById(bookingId).populate("room");
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "checked_in") {
    throw new Error("Guest is not currently checked in.");
  }

  booking.status = "checked_out";
  booking.checkOutTime = new Date();
  booking.roomKeyIssued = false;
  await booking.save();

  // Update room status to available and housekeeping to dirty for cleaning
  const room = await Room.findById(booking.room._id);
  if (room) {
    room.status = "available";
    room.housekeepingStatus = "dirty"; // Ready for housekeeping team
    await room.save();
  }

  // Audit log
  await AuditLog.create({
    user: staffUser?._id,
    userName: staffUser?.name || "Front Desk",
    userRole: staffUser?.role || "receptionist",
    action: "GUEST_CHECKED_OUT",
    entityType: "Booking",
    entityId: booking._id.toString(),
    details: {
      bookingNumber: booking.bookingNumber,
      roomNumber: booking.room.roomNumber,
    },
  });

  // Notification
  await sendNotification({
    targetRoles: ["admin", "hotel_manager", "receptionist"],
    type: "check_out",
    title: `Guest Checked Out: Room ${booking.room.roomNumber}`,
    message: `${booking.guestDetails.name} checked out of Room ${booking.room.roomNumber}. Room marked dirty for housekeeping.`,
    data: { bookingId: booking._id, roomId: booking.room._id },
  });

  return booking;
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId, reason, user) {
  const booking = await Booking.findById(bookingId).populate("room");
  if (!booking) throw new Error("Booking not found");

  if (booking.status === "checked_in") {
    throw new Error("Cannot cancel an active checked-in booking. Please check-out instead.");
  }
  if (booking.status === "cancelled") {
    throw new Error("Booking is already cancelled.");
  }

  booking.status = "cancelled";
  booking.cancellationReason = reason || "Cancelled by user";
  booking.cancelledAt = new Date();
  await booking.save();

  // Reset room status if needed
  const room = await Room.findById(booking.room._id);
  if (room && room.status === "occupied") {
    room.status = "available";
    await room.save();
  }

  // Audit log
  await AuditLog.create({
    user: user?._id,
    userName: user?.name || "User",
    userRole: user?.role || "customer",
    action: "BOOKING_CANCELLED",
    entityType: "Booking",
    entityId: booking._id.toString(),
    details: {
      bookingNumber: booking.bookingNumber,
      reason,
    },
  });

  // Notification
  await sendNotification({
    targetRoles: ["admin", "hotel_manager", "receptionist"],
    type: "booking_cancelled",
    title: `Booking Cancelled: ${booking.bookingNumber}`,
    message: `Reservation ${booking.bookingNumber} for ${booking.guestDetails.name} was cancelled. Room ${booking.room.roomNumber} is now available.`,
    data: { bookingId: booking._id },
    guestEmail: booking.guestDetails.email,
  });

  return booking;
}

module.exports = {
  checkRoomAvailability,
  findAvailableRooms,
  generateBookingNumber,
  createBooking,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
};
