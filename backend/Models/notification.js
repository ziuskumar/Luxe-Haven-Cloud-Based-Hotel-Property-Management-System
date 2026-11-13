const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means broadcast to staff roles
    },
    targetRoles: [
      {
        type: String,
        enum: ["admin", "hotel_manager", "receptionist", "customer"],
      },
    ],
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_cancelled",
        "check_in",
        "check_out",
        "payment_received",
        "room_status",
        "system_alert",
      ],
      default: "system_alert",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

module.exports = Notification;
