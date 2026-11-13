/**
 * Automated Billing & Sequential Invoice Service for Luxe Haven PMS
 * Generates GST-compliant itemized invoices and downloadable PDF invoices using PDFKit.
 */

const PDFDocument = require("pdfkit");
const Invoice = require("../Models/invoice.js");

/**
 * Generate next sequential invoice number (e.g. INV-2026-0001)
 */
async function generateInvoiceNumber() {
  const mongoose = require("mongoose");
  const year = new Date().getFullYear();
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const count = await Invoice.countDocuments();
      const seq = (count + 1).toString().padStart(4, "0");
      return `INV-${year}-${seq}`;
    } catch (err) {}
  }
  return `INV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Automatically create an invoice when a booking is confirmed
 */
async function createInvoiceForBooking(booking, room) {
  const invoiceNumber = await generateInvoiceNumber();

  const lineItems = [
    {
      description: `Room Stay: ${room.title} (Room ${room.roomNumber}, Category: ${room.category})`,
      quantity: booking.nights,
      unitPrice: booking.pricing.baseRatePerNight,
      total: booking.pricing.subtotal,
    },
  ];

  if (booking.pricing.dynamicAdjustment > 0) {
    lineItems.push({
      description: "Dynamic Pricing Adjustment (Weekend / Peak Season Multiplier)",
      quantity: 1,
      unitPrice: booking.pricing.dynamicAdjustment,
      total: booking.pricing.dynamicAdjustment,
    });
  }

  if (Array.isArray(booking.extraServices) && booking.extraServices.length > 0) {
    booking.extraServices.forEach((srv) => {
      lineItems.push({
        description: `Extra Service: ${srv.name}`,
        quantity: 1,
        unitPrice: srv.cost,
        total: srv.cost,
      });
    });
  }

  const preTaxSubtotal = booking.pricing.subtotal + (booking.pricing.dynamicAdjustment || 0) + (booking.pricing.extraServicesTotal || 0);

  const invoice = new Invoice({
    invoiceNumber,
    booking: booking._id,
    guest: booking.guest,
    room: room._id,
    guestName: booking.guestDetails.name,
    guestEmail: booking.guestDetails.email,
    guestPhone: booking.guestDetails.phone || "",
    issueDate: new Date(),
    dueDate: booking.checkInDate,
    lineItems,
    subtotal: preTaxSubtotal,
    cgst: booking.pricing.cgst,
    sgst: booking.pricing.sgst,
    totalTax: booking.pricing.taxAmount,
    discount: booking.pricing.discountAmount,
    grandTotal: booking.pricing.totalAmount,
    paidAmount: booking.paymentStatus === "paid" ? booking.pricing.totalAmount : 0,
    balanceDue: booking.paymentStatus === "paid" ? 0 : booking.pricing.totalAmount,
    paymentStatus: booking.paymentStatus === "paid" ? "paid" : "pending",
    paymentMethod: booking.paymentMethod || "card",
  });

  await invoice.save();
  return invoice;
}

/**
 * Generate PDF buffer using PDFKit
 */
async function generateInvoicePDFBuffer(invoiceId) {
  const invoice = await Invoice.findById(invoiceId)
    .populate("room")
    .populate("booking");

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#0f172a"; // slate-900
      const accentColor = "#0284c7"; // sky-600
      const lightBg = "#f8fafc"; // slate-50
      const mutedColor = "#64748b"; // slate-500

      // --- HEADER & BRANDING ---
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("LUXE HAVEN", 40, 40);

      doc
        .fillColor(accentColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("HOTEL PROPERTY MANAGEMENT SYSTEM", 40, 65);

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font("Helvetica")
        .text("100 Ocean Boulevard, Marina Bay", 40, 80)
        .text("GSTIN: 27AAACL1234H1Z5 | Support: support@luxehaven.com", 40, 92)
        .text("Phone: +1 (800) 589-3428 | Web: www.luxehaven.pms", 40, 104);

      // --- INVOICE BADGE & STATUS ---
      doc
        .fillColor(primaryColor)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 400, 40, { align: "right" });

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(accentColor)
        .text(invoice.invoiceNumber, 400, 64, { align: "right" });

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 400, 80, { align: "right" })
        .text(`Due Date: ${new Date(invoice.dueDate || invoice.issueDate).toLocaleDateString()}`, 400, 92, { align: "right" })
        .text(`Payment: ${invoice.paymentMethod.toUpperCase()}`, 400, 104, { align: "right" });

      // Status stamp box
      const isPaid = invoice.paymentStatus === "paid";
      const stampColor = isPaid ? "#16a34a" : "#d97706";
      doc
        .rect(460, 120, 95, 24)
        .lineWidth(1)
        .strokeColor(stampColor)
        .stroke();
      doc
        .fillColor(stampColor)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(isPaid ? "PAID IN FULL" : "PAYMENT PENDING", 460, 127, { width: 95, align: "center" });

      // Horizontal separator
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(40, 155)
        .lineTo(555, 155)
        .stroke();

      // --- BILLED TO & STAY DETAILS ---
      const yBilled = 170;
      doc
        .fillColor(accentColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("BILLED TO (GUEST DETAILS)", 40, yBilled);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(invoice.guestName, 40, yBilled + 15);

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font("Helvetica")
        .text(`Email: ${invoice.guestEmail}`, 40, yBilled + 30)
        .text(`Phone: ${invoice.guestPhone || "N/A"}`, 40, yBilled + 42);

      // Stay details on the right
      doc
        .fillColor(accentColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("RESERVATION SUMMARY", 320, yBilled);

      const bookingRef = invoice.booking?.bookingNumber || "N/A";
      const roomNum = invoice.room?.roomNumber || "N/A";
      const roomCat = invoice.room?.category || "Standard";
      const checkInStr = invoice.booking ? new Date(invoice.booking.checkInDate).toLocaleDateString() : "N/A";
      const checkOutStr = invoice.booking ? new Date(invoice.booking.checkOutDate).toLocaleDateString() : "N/A";

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font("Helvetica")
        .text(`Booking Number: ${bookingRef}`, 320, yBilled + 15)
        .text(`Room: #${roomNum} (${roomCat})`, 320, yBilled + 27)
        .text(`Check-In: ${checkInStr}`, 320, yBilled + 39)
        .text(`Check-Out: ${checkOutStr} (${invoice.booking?.nights || 1} Night(s))`, 320, yBilled + 51);

      // --- TABLE HEADER ---
      let currentY = 245;
      doc
        .rect(40, currentY, 515, 22)
        .fill(lightBg);

      doc
        .fillColor(primaryColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("DESCRIPTION", 50, currentY + 6)
        .text("QTY / NIGHTS", 310, currentY + 6, { width: 65, align: "center" })
        .text("UNIT RATE", 380, currentY + 6, { width: 75, align: "right" })
        .text("AMOUNT", 465, currentY + 6, { width: 80, align: "right" });

      currentY += 26;

      // --- LINE ITEMS ---
      invoice.lineItems.forEach((item, index) => {
        doc
          .fillColor("#334155")
          .fontSize(8)
          .font("Helvetica")
          .text(item.description, 50, currentY, { width: 250 })
          .text(item.quantity.toString(), 310, currentY, { width: 65, align: "center" })
          .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, currentY, { width: 75, align: "right" })
          .text(`$${Number(item.total).toFixed(2)}`, 465, currentY, { width: 80, align: "right" });

        currentY += 20;

        // Draw light bottom line
        doc
          .strokeColor("#f1f5f9")
          .lineWidth(0.5)
          .moveTo(40, currentY - 4)
          .lineTo(555, currentY - 4)
          .stroke();
      });

      currentY += 10;

      // --- TOTALS & GST BREAKDOWN ---
      const totalsStartX = 340;
      const valuesStartX = 465;

      const printSummaryRow = (label, value, isBold = false) => {
        doc
          .fillColor(isBold ? primaryColor : mutedColor)
          .fontSize(isBold ? 9 : 8)
          .font(isBold ? "Helvetica-Bold" : "Helvetica")
          .text(label, totalsStartX, currentY, { width: 120, align: "left" })
          .text(`$${Number(value).toFixed(2)}`, valuesStartX, currentY, { width: 80, align: "right" });
        currentY += 15;
      };

      printSummaryRow("Subtotal:", invoice.subtotal);
      if (invoice.discount > 0) {
        printSummaryRow("Discount:", -invoice.discount);
      }
      printSummaryRow("CGST (9%):", invoice.cgst);
      printSummaryRow("SGST (9%):", invoice.sgst);
      printSummaryRow("Total Tax (GST 18%):", invoice.totalTax);

      // Grand total highlight
      doc
        .rect(totalsStartX - 10, currentY, 225, 24)
        .fill("#f0fdf4");

      doc
        .fillColor("#15803d")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("GRAND TOTAL:", totalsStartX, currentY + 6)
        .text(`$${Number(invoice.grandTotal).toFixed(2)}`, valuesStartX, currentY + 6, { width: 80, align: "right" });

      currentY += 32;

      printSummaryRow("Amount Paid:", invoice.paidAmount);
      printSummaryRow("Balance Due:", invoice.balanceDue, true);

      // --- PAYMENT & FOOTER ---
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(40, currentY + 20)
        .lineTo(555, currentY + 20)
        .stroke();

      const footerY = currentY + 30;
      doc
        .fillColor(accentColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("TERMS & CONDITIONS", 40, footerY);

      doc
        .fillColor(mutedColor)
        .fontSize(7)
        .font("Helvetica")
        .text("1. All room rates are subject to applicable GST under HSN code 9963.", 40, footerY + 12)
        .text("2. Standard check-in is 2:00 PM and check-out is 11:00 AM.", 40, footerY + 22)
        .text("3. Sequential GST invoice generated electronically by Luxe Haven PMS.", 40, footerY + 32)
        .text("This is a computer-generated invoice and requires no physical signature.", 40, footerY + 44, {
          width: 515,
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInvoiceNumber,
  createInvoiceForBooking,
  generateInvoicePDFBuffer,
};
