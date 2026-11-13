/**
 * Pricing Engine for Luxe Haven PMS
 * Dynamic pricing calculation based on weekend surcharges, occupancy rates, seasonal factors, and taxes.
 */

const Room = require("../Models/room.js");
const Booking = require("../Models/booking.js");

// Promo codes dictionary
const PROMO_CODES = {
  LUXE10: { type: "percent", value: 10 },
  WELCOME20: { type: "percent", value: 20 },
  VIP50: { type: "percent", value: 50 },
  DIRECT5: { type: "percent", value: 5 },
};

/**
 * Calculate dates between checkIn and checkOut
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr < end) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * Check if a date is a weekend (Friday or Saturday night)
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

/**
 * Calculate dynamic pricing for a room between checkIn and checkOut
 */
async function calculateRoomPrice({
  roomId,
  checkInDate,
  checkOutDate,
  promoCode = "",
  extraServices = [],
}) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dates = getDatesInRange(checkIn, checkOut);

  // Check current hotel occupancy rate to compute surge pricing
  const totalRoomsCount = await Room.countDocuments({ isActive: true });
  const activeBookingsCount = await Booking.countDocuments({
    status: { $in: ["confirmed", "checked_in"] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

  const occupancyRate = totalRoomsCount > 0 ? activeBookingsCount / totalRoomsCount : 0;

  const weekendMultiplier = room.dynamicPricing?.weekendMultiplier || 1.15;
  const seasonalMultiplier = room.dynamicPricing?.seasonalMultiplier || 1.0;
  const surgeThreshold = room.dynamicPricing?.surgeThreshold || 0.8;
  const surgeMultiplier = room.dynamicPricing?.surgeMultiplier || 1.2;

  let baseSubtotal = 0;
  let dynamicAdjustment = 0;

  for (const date of dates) {
    let nightPrice = room.basePrice;
    baseSubtotal += room.basePrice;

    let nightMultiplier = 1.0;
    // Weekend check
    if (isWeekend(date)) {
      nightMultiplier *= weekendMultiplier;
    }
    // High season check
    nightMultiplier *= seasonalMultiplier;

    // High occupancy surge check (> 80% occupancy)
    if (occupancyRate >= surgeThreshold) {
      nightMultiplier *= surgeMultiplier;
    }

    const adjustedPrice = room.basePrice * nightMultiplier;
    dynamicAdjustment += adjustedPrice - room.basePrice;
  }

  dynamicAdjustment = Math.round(dynamicAdjustment * 100) / 100;
  const roomTotal = Math.round((baseSubtotal + dynamicAdjustment) * 100) / 100;

  // Extra services calculation
  let extraServicesTotal = 0;
  if (Array.isArray(extraServices)) {
    extraServicesTotal = extraServices.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
  }

  // Pre-tax subtotal
  const preTaxTotal = roomTotal + extraServicesTotal;

  // Discount calculation
  let discountAmount = 0;
  const cleanCode = (promoCode || "").trim().toUpperCase();
  if (cleanCode && PROMO_CODES[cleanCode]) {
    const promo = PROMO_CODES[cleanCode];
    if (promo.type === "percent") {
      discountAmount = Math.round((preTaxTotal * (promo.value / 100)) * 100) / 100;
    }
  }

  const taxableAmount = Math.max(0, preTaxTotal - discountAmount);

  // GST calculation: 18% total (9% CGST + 9% SGST)
  // If price <= 1000 INR / $100, GST can be 12%, standard hotel tier is 18%
  const taxRate = room.basePrice >= 7500 ? 18 : 12;
  const halfTaxRate = taxRate / 2;
  const cgst = Math.round((taxableAmount * (halfTaxRate / 100)) * 100) / 100;
  const sgst = Math.round((taxableAmount * (halfTaxRate / 100)) * 100) / 100;
  const taxAmount = Math.round((cgst + sgst) * 100) / 100;

  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    roomId: room._id,
    roomTitle: room.title,
    roomNumber: room.roomNumber,
    category: room.category,
    baseRatePerNight: room.basePrice,
    nights,
    baseSubtotal: Math.round(baseSubtotal * 100) / 100,
    dynamicAdjustment,
    roomTotal,
    extraServicesTotal,
    discountCode: cleanCode,
    discountAmount,
    taxableAmount,
    taxRate,
    cgst,
    sgst,
    taxAmount,
    totalAmount,
    occupancyRate: Math.round(occupancyRate * 100),
  };
}

module.exports = {
  calculateRoomPrice,
  PROMO_CODES,
  isWeekend,
};
