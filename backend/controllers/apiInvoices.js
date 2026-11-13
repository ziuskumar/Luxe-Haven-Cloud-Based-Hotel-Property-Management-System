const Invoice = require("../Models/invoice.js");
const Booking = require("../Models/booking.js");
const { generateInvoicePDFBuffer } = require("../services/invoiceService.js");

module.exports = {
  // Get list of invoices
  async getInvoices(req, res) {
    try {
      const { paymentStatus, search } = req.query;
      const query = {};

      if (req.user.role === "customer") {
        query.guest = req.user._id;
      }

      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (search) {
        query.$or = [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { guestName: { $regex: search, $options: "i" } },
          { guestEmail: { $regex: search, $options: "i" } },
        ];
      }

      const invoices = await Invoice.find(query)
        .populate("room")
        .populate("booking")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: invoices.length,
        invoices,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get single invoice
  async getInvoice(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate("room")
        .populate("booking")
        .populate("guest", "name email phone");

      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found." });
      }

      if (
        req.user.role === "customer" &&
        invoice.guest._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      res.json({ success: true, invoice });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Download PDF invoice
  async downloadPDF(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found." });
      }

      if (
        req.user.role === "customer" &&
        invoice.guest.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const pdfBuffer = await generateInvoicePDFBuffer(invoice._id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Mark invoice as paid / record payment
  async recordPayment(req, res) {
    try {
      const { paymentMethod, paidAmount } = req.body;
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found." });
      }

      const amount = Number(paidAmount) || invoice.balanceDue;
      invoice.paidAmount += amount;
      invoice.balanceDue = Math.max(0, invoice.grandTotal - invoice.paidAmount);
      invoice.paymentStatus = invoice.balanceDue === 0 ? "paid" : "partially_paid";
      if (paymentMethod) invoice.paymentMethod = paymentMethod;

      await invoice.save();

      // Sync booking payment status
      await Booking.findByIdAndUpdate(invoice.booking, {
        paymentStatus: invoice.paymentStatus,
        paidAmount: invoice.paidAmount,
      });

      res.json({
        success: true,
        message: "Payment recorded successfully.",
        invoice,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
