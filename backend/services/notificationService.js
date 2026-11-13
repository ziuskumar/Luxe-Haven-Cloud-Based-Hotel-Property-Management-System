/**
 * Real-Time Notification & Email Service for Luxe Haven PMS
 * Integrates Socket.IO live notifications with Nodemailer automated email delivery.
 */

const nodemailer = require("nodemailer");
const Notification = require("../Models/notification.js");

let ioInstance = null;
let mailTransporter = null;

/**
 * Initialize Socket.IO instance
 */
function initSocket(server) {
  const { Server } = require("socket.io");
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    // Client can join role room e.g. "role:admin", "role:receptionist", or "user:<id>"
    socket.on("join", (roomName) => {
      if (roomName) {
        socket.join(roomName);
      }
    });

    socket.on("disconnect", () => {});
  });

  return ioInstance;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  return ioInstance;
}

/**
 * Initialize or get Nodemailer Transporter
 */
function getTransporter() {
  if (mailTransporter) return mailTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Safe mock transporter that prints to console during demo/dev
    mailTransporter = {
      sendMail: async (mailOptions) => {
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  return mailTransporter;
}

/**
 * Dispatch notification: save to DB, emit over Socket.IO, and trigger email
 */
async function sendNotification({
  recipient = null,
  targetRoles = ["admin", "hotel_manager", "receptionist"],
  type = "system_alert",
  title,
  message,
  data = {},
  guestEmail = null,
  bookingDetails = null,
}) {
  try {
    // 1. Save in database
    const notification = await Notification.create({
      recipient,
      targetRoles,
      type,
      title,
      message,
      data,
    });

    // 2. Broadcast via Socket.IO
    if (ioInstance) {
      ioInstance.emit("notification", notification);

      targetRoles.forEach((role) => {
        ioInstance.to(`role:${role}`).emit("role_notification", notification);
      });

      if (recipient) {
        ioInstance.to(`user:${recipient}`).emit("user_notification", notification);
      }
    }

    // 3. Send email if recipient email is provided
    if (guestEmail) {
      const transporter = getTransporter();
      const subject = `Luxe Haven PMS - ${title}`;
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">LUXE HAVEN</h1>
            <p style="margin: 4px 0 0; font-size: 11px; color: #38bdf8;">HOTEL PROPERTY MANAGEMENT SYSTEM</p>
          </div>
          <div style="padding: 20px 0;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">${title}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">${message}</p>
            ${
              bookingDetails
                ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
                <h4 style="margin: 0 0 10px; color: #0284c7; font-size: 13px;">RESERVATION OVERVIEW</h4>
                <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Booking Reference:</strong> ${bookingDetails.bookingNumber}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Room:</strong> #${bookingDetails.roomNumber} - ${bookingDetails.roomTitle}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Check-In:</strong> ${bookingDetails.checkInDate}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Check-Out:</strong> ${bookingDetails.checkOutDate}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #16a34a; font-weight: bold;"><strong>Total:</strong> $${bookingDetails.totalAmount}</p>
              </div>
            `
                : ""
            }
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              For any questions or adjustments, please reply to this email or visit your customer dashboard.
            </p>
          </div>
          <div style="text-align: center; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} Luxe Haven Cloud PMS. All rights reserved.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Luxe Haven PMS" <${process.env.SMTP_FROM || "reservations@luxehaven.pms"}>`,
        to: guestEmail,
        subject,
        html: htmlBody,
      });
    }

    return notification;
  } catch (err) {
    console.error("Failed to process notification:", err.message);
  }
}

module.exports = {
  initSocket,
  getIO,
  sendNotification,
};
