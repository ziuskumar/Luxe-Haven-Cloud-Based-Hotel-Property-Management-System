const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      specialRequests: { type: String, default: "" },
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfGuests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "confirmed",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    roomKeyIssued: {
      type: Boolean,
      default: false,
    },
    roomKeyNumber: {
      type: String,
      default: "",
    },
    pricing: {
      baseRatePerNight: { type: Number, required: true },
      nights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      dynamicAdjustment: { type: Number, default: 0 },
      taxRate: { type: Number, default: 18 }, // 18% GST (9% CGST + 9% SGST)
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      discountCode: { type: String, default: "" },
      extraServicesTotal: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    extraServices: [
      {
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partially_paid", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "cash", "bank_transfer", "online"],
      default: "card",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: String,
      default: "",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1, status: 1 });
bookingSchema.index({ guest: 1, status: 1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
module.exports = Booking;
