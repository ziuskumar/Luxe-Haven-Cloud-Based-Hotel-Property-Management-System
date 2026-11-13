const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Standard",
        "Deluxe",
        "Executive Suite",
        "Presidential Suite",
        "Ocean Villa",
        "Family Suite",
      ],
      default: "Deluxe",
      required: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    bedType: {
      type: String,
      enum: ["Single", "Double", "Queen", "King", "Twin"],
      default: "King",
    },
    maxOccupancy: {
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 1 },
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    dynamicPricing: {
      weekendMultiplier: { type: Number, default: 1.15 }, // +15% Friday & Saturday
      seasonalMultiplier: { type: Number, default: 1.0 }, // Multiplier for peak seasons
      surgeThreshold: { type: Number, default: 0.8 }, // 80% occupancy triggers surge
      surgeMultiplier: { type: Number, default: 1.2 }, // +20% surge
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, default: "" },
      },
    ],
    housekeepingStatus: {
      type: String,
      enum: ["clean", "dirty", "inspected", "maintenance"],
      default: "clean",
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "out_of_service"],
      default: "available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual index for searching
roomSchema.index({ category: 1, status: 1, basePrice: 1 });

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
module.exports = Room;
