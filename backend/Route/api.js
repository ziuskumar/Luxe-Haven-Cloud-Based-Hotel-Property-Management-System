const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middleware/auth.js");

const apiAuth = require("../controllers/apiAuth.js");
const apiRooms = require("../controllers/apiRooms.js");
const apiBookings = require("../controllers/apiBookings.js");
const apiInvoices = require("../controllers/apiInvoices.js");
const apiCalendar = require("../controllers/apiCalendar.js");
const apiAnalytics = require("../controllers/apiAnalytics.js");
const apiNotifications = require("../controllers/apiNotifications.js");

// --- 1. AUTHENTICATION & USERS (RBAC) ---
router.post("/auth/register", apiAuth.register);
router.post("/auth/login", apiAuth.login);
router.get("/auth/me", protect, apiAuth.getMe);
router.get("/auth/users", protect, restrictTo("admin"), apiAuth.listUsers);
router.put("/auth/users/:id", protect, restrictTo("admin"), apiAuth.updateUser);

// --- 2. ROOM MANAGEMENT & AVAILABILITY ---
router.get("/rooms", apiRooms.getRooms);
router.get("/rooms/:id", apiRooms.getRoom);
router.post("/rooms", protect, restrictTo("admin", "hotel_manager"), apiRooms.createRoom);
router.put("/rooms/:id", protect, restrictTo("admin", "hotel_manager"), apiRooms.updateRoom);
router.patch(
  "/rooms/:id/housekeeping",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiRooms.updateHousekeepingStatus
);
router.delete("/rooms/:id", protect, restrictTo("admin"), apiRooms.deleteRoom);

// --- 3. RESERVATIONS & BOOKINGS ENGINE ---
router.get("/bookings/check-availability", apiBookings.checkAvailability);
router.post("/bookings/calculate-price", apiBookings.calculatePrice);
router.post("/bookings", protect, apiBookings.create);
router.get("/bookings", protect, apiBookings.getBookings);
router.get("/bookings/:id", protect, apiBookings.getBooking);
router.post("/bookings/:id/cancel", protect, apiBookings.cancel);
router.post(
  "/bookings/:id/check-in",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiBookings.checkIn
);
router.post(
  "/bookings/:id/check-out",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiBookings.checkOut
);

// --- 4. BILLING & INVOICES (PDFKit) ---
router.get("/invoices", protect, apiInvoices.getInvoices);
router.get("/invoices/:id", protect, apiInvoices.getInvoice);
router.get("/invoices/:id/download", protect, apiInvoices.downloadPDF);
router.post(
  "/invoices/:id/payment",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiInvoices.recordPayment
);

// --- 5. CALENDAR & FRONT DESK SCHEDULE ---
router.get(
  "/calendar/events",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiCalendar.getEvents
);
router.get(
  "/calendar/daily",
  protect,
  restrictTo("admin", "hotel_manager", "receptionist"),
  apiCalendar.getDailySchedule
);

// --- 6. ADMIN & MANAGER ANALYTICS DASHBOARD ---
router.get(
  "/analytics",
  protect,
  restrictTo("admin", "hotel_manager"),
  apiAnalytics.getDashboardAnalytics
);

// --- 7. NOTIFICATIONS & ALERTS ---
router.get("/notifications", protect, apiNotifications.getNotifications);
router.patch("/notifications/:id/read", protect, apiNotifications.markAsRead);
router.post("/notifications/read-all", protect, apiNotifications.markAllAsRead);

module.exports = router;
