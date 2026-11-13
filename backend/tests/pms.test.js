const { calculateRoomPrice, isWeekend, PROMO_CODES } = require("../services/pricingService.js");
const { generateBookingNumber } = require("../services/reservationService.js");
const { generateInvoiceNumber, generateInvoicePDFBuffer } = require("../services/invoiceService.js");
const { signToken, verifyToken } = require("../utils/jwt.js");

describe("Luxe Haven Hotel PMS - Unit & Engine Tests", () => {
  describe("01 · Dynamic Pricing Engine", () => {
    test("isWeekend correctly identifies Friday and Saturday", () => {
      const friday = new Date("2026-11-20T12:00:00Z"); // Friday
      const saturday = new Date("2026-11-21T12:00:00Z"); // Saturday
      const sunday = new Date("2026-11-22T12:00:00Z"); // Sunday
      const wednesday = new Date("2026-11-25T12:00:00Z"); // Wednesday

      expect(isWeekend(friday)).toBe(true);
      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(false);
      expect(isWeekend(wednesday)).toBe(false);
    });

    test("PROMO_CODES contains valid discount percentages", () => {
      expect(PROMO_CODES.LUXE10).toEqual({ type: "percent", value: 10 });
      expect(PROMO_CODES.WELCOME20).toEqual({ type: "percent", value: 20 });
    });
  });

  describe("02 · RBAC & JWT Security", () => {
    test("signToken creates valid token and verifyToken decodes correct user role", () => {
      const mockAdmin = {
        _id: "65a316132293212121212121",
        username: "admin_test",
        email: "admin@test.com",
        role: "admin",
        name: "Admin User",
      };

      const token = signToken(mockAdmin);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(mockAdmin._id);
      expect(decoded.role).toBe("admin");
      expect(decoded.username).toBe("admin_test");
    });

    test("signToken creates distinct tokens for different roles", () => {
      const receptionist = {
        _id: "65a316132293212121212122",
        username: "reception_test",
        email: "reception@test.com",
        role: "receptionist",
        name: "Front Desk Staff",
      };

      const token = signToken(receptionist);
      const decoded = verifyToken(token);
      expect(decoded.role).toBe("receptionist");
    });
  });

  describe("03 · Booking & Invoice Sequential Numbering", () => {
    test("generateBookingNumber returns valid format BK-YYYY-XXXX", async () => {
      const bookingNumber = await generateBookingNumber();
      expect(bookingNumber).toMatch(/^BK-\d{4}-\d{4}$/);
    });

    test("generateInvoiceNumber returns sequential format INV-YYYY-XXXX", async () => {
      const invoiceNumber = await generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    });
  });
});
